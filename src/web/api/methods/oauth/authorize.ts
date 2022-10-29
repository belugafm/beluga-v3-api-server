import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { AuthorizeUserApplication, ErrorCodes } from "../../../../application/oauth/Authorize"
import {
    TransactionRepository,
    RequestTokenCommandRepository,
    RequestTokenQueryRepository,
} from "../../../repositories"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import * as vs from "../../../../domain/validation"
import { AuthenticationMethods } from "../../facts/authentication_method"

export const argumentSpecs = defineArguments(["request_token", "request_token_secret"] as const, {
    request_token: {
        description: [""],
        examples: ["xxxxxx-xxxxxxx-xxxxxxx"],
        required: true,
        validator: vs.string({ minLength: 1, maxLength: 100 }),
    },
    request_token_secret: {
        description: [""],
        examples: ["xxxxxx-xxxxxxx-xxxxxxx"],
        required: true,
        validator: vs.string({ minLength: 1, maxLength: 100 }),
    },
})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.InvalidRequestToken, ErrorCodes.Expired, "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        invalid_request_token: {
            description: ["無効なリクエストトークンです"],
            hint: [],
            code: "invalid_request_token",
            argument: "request_token",
        },
        expired: {
            description: ["このページの有効期限が切れました", "一度このページを閉じて再度やり直してください"],
            hint: [],
            code: "expired",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.Authorize,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: [],
}

type ReturnType = Promise<string>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (authUser == null) {
        raise(errors["internal_error"])
    }
    const transaction = await TransactionRepository.new<ReturnType>()
    try {
        return await transaction.$transaction(async (transactionSession) => {
            return await new AuthorizeUserApplication(
                new RequestTokenCommandRepository(transactionSession),
                new RequestTokenQueryRepository(transactionSession)
            ).authorize({
                userId: authUser.id,
                requestToken: args.request_token,
                requestTokenSecret: args.request_token_secret,
            })
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code == ErrorCodes.Expired) {
                raise(errors["expired"], error)
            } else if (error.code == ErrorCodes.InvalidRequestToken) {
                raise(errors["invalid_request_token"], error)
            }
            raise(errors["internal_error"], error)
        } else if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
