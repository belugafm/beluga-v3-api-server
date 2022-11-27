import * as vs from "../../../../../domain/validation"

import {
    AuthenticityTokenCommandRepository,
    LoginSessionCommandRepository,
    TransactionRepository,
} from "../../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../../define"
import { UserCommandRepository, UserQueryRepository } from "../../../../repositories"

import { ApplicationError } from "../../../../../application/ApplicationError"
import { AuthenticityTokenEntity } from "../../../../../domain/entity/AuthenticityToken"
import { ContentTypes } from "../../../facts/content_type"
import { HttpMethods } from "../../../facts/http_method"
import { LoginSessionEntity } from "../../../../../domain/entity/LoginSession"
import { MethodIdentifiers } from "../../../identifier"
import { SignInWithTwitterApplication } from "../../../../../application/signin/SignInWithTwitter"
import { TwitterAuthenticationApplication } from "../../../../../application/authentication/Twitter"
import { UserEntity } from "../../../../../domain/entity/User"

export const argumentSpecs = defineArguments(
    ["oauth_token", "oauth_verifier", "auth_session_id", "ip_address"] as const,
    {
        oauth_token: {
            description: ["oauth_token"],
            examples: ["XXXXXXXXXX-XXXXXXXXXXXXX"],
            required: true,
            validator: vs.StringValidator(),
        },
        oauth_verifier: {
            description: ["oauth_verifier"],
            examples: ["XXXXXXXXXX-XXXXXXXXXXXXX"],
            required: true,
            validator: vs.StringValidator(),
        },
        auth_session_id: {
            description: ["セッションID"],
            examples: ["XXXXXXXXXX-XXXXXXXXXXXXX"],
            required: true,
            validator: vs.StringValidator(),
        },
        ip_address: {
            description: ["登録時のIPアドレス"],
            examples: ["192.168.1.1"],
            required: true,
            validator: vs.IpAddressValidator(),
        },
    }
)

export const expectedErrorSpecs = defineErrors(["internal_error", "unexpected_error"] as const, argumentSpecs, {
    internal_error: new InternalErrorSpec(),
    unexpected_error: new UnexpectedErrorSpec(),
})

export const facts: MethodFacts = {
    url: MethodIdentifiers.AuthenticateUserWithTwitter,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: [],
}

type ReturnType = Promise<[UserEntity, LoginSessionEntity, AuthenticityTokenEntity]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const user = await new TwitterAuthenticationApplication(
                new UserQueryRepository(),
                new UserCommandRepository()
            ).authenticate({
                requestToken: args.oauth_token,
                verifier: args.oauth_verifier,
                ipAddress: args.ip_address,
                authSessionId: args.auth_session_id,
            })
            const [_, loginSession, authenticityToken] = await new SignInWithTwitterApplication(
                new UserQueryRepository(transactionSession),
                new LoginSessionCommandRepository(transactionSession),
                new AuthenticityTokenCommandRepository(transactionSession)
            ).signin({
                // @ts-ignore
                twitterUserId: user.twitterUserId,
                ipAddress: args.ip_address,
                lastLocation: null,
                device: null,
            })
            return [user, loginSession, authenticityToken]
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            raise(errors["internal_error"], error)
        } else if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
