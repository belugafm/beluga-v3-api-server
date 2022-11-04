import * as vs from "../../../../domain/validation"

import { MessageQueryRepository } from "../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { MessageJsonObjectT } from "../../../../domain/types"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { includeMessageRelations } from "../../relations/message"

export const argumentSpecs = defineArguments(["id"] as const, {
    id: {
        description: [],
        examples: ["123456"],
        required: true,
        validator: vs.messageId(),
    },
})

export const expectedErrorSpecs = defineErrors(
    ["missing_argument", "not_found", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        missing_argument: {
            description: ["`id`を指定してください"],
            hint: [],
            code: "missing_argument",
        },
        not_found: {
            description: ["指定されたメッセージが見つかりませんでした"],
            hint: [],
            code: "not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ShowMessage,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["メッセージの情報を取得します"],
}

type ReturnType = Promise<MessageJsonObjectT | null>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (args.id == null) {
        raise(errors["missing_argument"])
    }
    try {
        const message = await new MessageQueryRepository().findById(args.id)
        if (message == null) {
            return null
        }
        const messageObj = message.toJsonObject()
        return await includeMessageRelations(messageObj, authUser)
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
