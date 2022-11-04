import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { AuthorizeUserApplication, ErrorCodes } from "../../../../application/oauth/Authorize"
import {
    TransactionRepository,
    RequestTokenCommandRepository,
    RequestTokenQueryRepository,
    ApplicationQueryRepository,
} from "../../../repositories"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import * as vs from "../../../../domain/validation"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ApplicationJsonObjectT } from "../../../../domain/types"

export const argumentSpecs = defineArguments(
    ["consumer_key", "consumer_secret", "request_token", "request_token_secret"] as const,
    {
        consumer_key: {
            description: [""],
            examples: ["xxxxxx-xxxxxxx-xxxxxxx"],
            required: true,
            validator: vs.string({ minLength: 1, maxLength: 100 }),
        },
        consumer_secret: {
            description: [""],
            examples: ["xxxxxx-xxxxxxx-xxxxxxx"],
            required: true,
            validator: vs.string({ minLength: 1, maxLength: 100 }),
        },
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
    }
)

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.InvalidRequestToken,
        ErrorCodes.Expired,
        "invalid_consumer_key",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        invalid_consumer_key: {
            description: ["consumer_keyまたはconsumer_secretを正しく指定してください"],
            hint: [],
            code: "invalid_consumer_key",
            argument: "consumer_key",
        },
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
    acceptedContentTypes: [ContentTypes.ApplicationJson, ContentTypes.ApplicationFormUrlEncoded],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: [],
}

type ReturnType = Promise<[string, ApplicationJsonObjectT]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (authUser == null) {
        raise(errors["internal_error"])
    }
    const transaction = await TransactionRepository.new<Promise<string>>()
    try {
        const app = await new ApplicationQueryRepository().findByTokenAndSecret(args.consumer_key, args.consumer_secret)
        if (app == null) {
            raise(errors["invalid_consumer_key"])
        }
        const verifier = await transaction.$transaction(async (transactionSession) => {
            return await new AuthorizeUserApplication(
                new RequestTokenCommandRepository(transactionSession),
                new RequestTokenQueryRepository(transactionSession)
            ).authorize({
                userId: authUser.id,
                requestToken: args.request_token,
                requestTokenSecret: args.request_token_secret,
            })
        })
        return [verifier, app.toJsonObject()]
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
