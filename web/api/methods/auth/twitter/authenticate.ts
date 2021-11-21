import * as vs from "../../../../../domain/validation"

import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../../define"
import { UsersCommandRepository, UsersQueryRepository } from "../../../../repositories"

import { ApplicationError } from "../../../../../application/ApplicationError"
import { ContentTypes } from "../../../facts/content_type"
import { HttpMethods } from "../../../facts/http_method"
import { MethodIdentifiers } from "../../../identifier"
import { TwitterAuthenticationApplication } from "../../../../../application/authentication/Twitter"
import { UserEntity } from "../../../../../domain/entity/User"

export const argumentSpecs = defineArguments(
    ["oauth_token", "oauth_verifier", "ip_address"] as const,
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
    async (args, errors): Promise<UserEntity | null> => {
        try {
            return await new TwitterAuthenticationApplication(
                new UsersQueryRepository(),
                new UsersCommandRepository()
            ).authenticate(args.oauth_token, args.oauth_verifier, args.ip_address)
        } catch (error) {
            if (error instanceof ApplicationError) {
                raise(errors["internal_error"], error)
            } else if (error instanceof Error) {
                raise(errors["unexpected_error"], error)
            } else {
                raise(errors["unexpected_error"], new Error("unexpected_error"))
            }
        }
        return null
    }
)
