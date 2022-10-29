import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { GenerateRequestTokenApplication, ErrorCodes } from "../../../../application/oauth/GenerateRequestToken"
import { TransactionRepository, RequestTokenCommandRepository, ApplicationQueryRepository } from "../../../repositories"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import * as vs from "../../../../domain/validation"
import { RequestTokenEntity } from "../../../../domain/entity/RequestToken"

export const argumentSpecs = defineArguments(["consumer_key", "consumer_secret"] as const, {
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
})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.InvalidConsumerKey, "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        invalid_consumer_key: {
            description: ["consumer_keyまたはconsumer_secretが間違っています"],
            hint: [],
            code: "invalid_consumer_key",
            argument: "consumer_key",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.GenerateRequestToken,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: [],
}

type ReturnType = Promise<RequestTokenEntity>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    try {
        return await transaction.$transaction(async (transactionSession) => {
            return await new GenerateRequestTokenApplication(
                new RequestTokenCommandRepository(transactionSession),
                new ApplicationQueryRepository(transactionSession)
            ).generate({
                consumerKey: args.consumer_key,
                consumerSecret: args.consumer_secret,
            })
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
