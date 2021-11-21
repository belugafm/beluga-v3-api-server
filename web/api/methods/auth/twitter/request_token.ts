import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../../define"
import {
    RequestTokenResponse,
    TwitterAuthenticationApplication,
} from "../../../../../application/authentication/Twitter"
import { UsersCommandRepository, UsersQueryRepository } from "../../../../repositories"

import { ApplicationError } from "../../../../../application/ApplicationError"
import { ContentTypes } from "../../../facts/content_type"
import { HttpMethods } from "../../../facts/http_method"
import { MethodIdentifiers } from "../../../identifier"

export const argumentSpecs = defineArguments([] as const, {})

export const expectedErrorSpecs = defineErrors(
    ["internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.GetTwitterRequestToken,
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
    async (args, errors): Promise<RequestTokenResponse | null> => {
        try {
            return await new TwitterAuthenticationApplication(
                new UsersQueryRepository(),
                new UsersCommandRepository()
            ).getRequestToken()
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
