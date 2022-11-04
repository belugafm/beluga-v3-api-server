import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { GenerateRequestTokenApplication, ErrorCodes } from "../../../../application/oauth/GenerateRequestToken"
import { TransactionRepository, RequestTokenCommandRepository, ApplicationQueryRepository } from "../../../repositories"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { RequestTokenEntity } from "../../../../domain/entity/RequestToken"

export const argumentSpecs = defineArguments([] as const, {})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.InvalidConsumerKey, "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        invalid_consumer_key: {
            description: ["consumer_keyが間違っています"],
            hint: [],
            code: "invalid_consumer_key",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.GenerateRequestToken,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson, ContentTypes.ApplicationFormUrlEncoded],
    userAuthenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: [],
}

type ReturnType = Promise<RequestTokenEntity>

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors, authUser, authApp): ReturnType => {
        if (authApp == null) {
            raise(errors["internal_error"])
        }
        const transaction = await TransactionRepository.new<ReturnType>()
        try {
            return await transaction.$transaction(async (transactionSession) => {
                return await new GenerateRequestTokenApplication(
                    new RequestTokenCommandRepository(transactionSession),
                    new ApplicationQueryRepository(transactionSession)
                ).generate({
                    consumerKey: authApp.token,
                    consumerSecret: authApp.secret,
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
    }
)
