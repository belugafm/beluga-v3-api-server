import * as vs from "../../../../../domain/validation"

import {
    AuthenticityTokenCommandRepository,
    LoginSessionsCommandRepository,
} from "../../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../../define"
import { UsersCommandRepository, UsersQueryRepository } from "../../../../repositories"

import { ApplicationError } from "../../../../../application/ApplicationError"
import { AuthenticityTokenEntity } from "../../../../../domain/entity/AuthenticityToken"
import { ContentTypes } from "../../../facts/content_type"
import { HttpMethods } from "../../../facts/http_method"
import { LoginSessionEntity } from "../../../../../domain/entity/LoginSession"
import { MethodIdentifiers } from "../../../identifier"
import { SignInWithTwitterApplication } from "../../../../../application/signin/SignInWithTwitter"
import { TransactionRepository } from "../../../../../infrastructure/mongodb/repository/Transaction"
import { TwitterAuthenticationApplication } from "../../../../../application/authentication/Twitter"
import { UserEntity } from "../../../../../domain/entity/User"

export const argumentSpecs = defineArguments(
    ["oauth_token", "oauth_verifier", "auth_session_id", "ip_address"] as const,
    {
        oauth_token: {
            description: ["oauth_token"],
            examples: ["XXXXXXXXXX-XXXXXXXXXXXXX"],
            required: true,
            validator: vs.string(),
        },
        oauth_verifier: {
            description: ["oauth_verifier"],
            examples: ["XXXXXXXXXX-XXXXXXXXXXXXX"],
            required: true,
            validator: vs.string(),
        },
        auth_session_id: {
            description: ["セッションID"],
            examples: ["XXXXXXXXXX-XXXXXXXXXXXXX"],
            required: true,
            validator: vs.string(),
        },
        ip_address: {
            description: ["登録時のIPアドレス"],
            examples: ["192.168.1.1"],
            required: true,
            validator: vs.ipAddress(),
        },
    }
)

export const expectedErrorSpecs = defineErrors(
    ["internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.AuthenticateUserWithTwitter,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: [],
}

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors): Promise<[UserEntity, LoginSessionEntity, AuthenticityTokenEntity]> => {
        const transaction = await TransactionRepository.new()
        await transaction.begin()
        try {
            const user = await new TwitterAuthenticationApplication(
                new UsersQueryRepository(),
                new UsersCommandRepository()
            ).authenticate({
                requestToken: args.oauth_token,
                verifier: args.oauth_verifier,
                ipAddress: args.ip_address,
                authSessionId: args.auth_session_id,
            })
            const [_, loginSession, authenticityToken] = await new SignInWithTwitterApplication(
                new UsersQueryRepository(transaction),
                new LoginSessionsCommandRepository(transaction),
                new AuthenticityTokenCommandRepository(transaction)
            ).signin({
                // @ts-ignore
                twitterUserId: user.twitterUserId,
                ipAddress: args.ip_address,
                lastLocation: null,
                device: null,
            })
            await transaction.commit()
            await transaction.end()
            return [user, loginSession, authenticityToken]
        } catch (error) {
            await transaction.rollback()
            await transaction.end()
            if (error instanceof ApplicationError) {
                raise(errors["internal_error"], error)
            } else if (error instanceof Error) {
                raise(errors["unexpected_error"], error)
            } else {
                raise(errors["unexpected_error"], new Error("unexpected_error"))
            }
        }
    }
)
