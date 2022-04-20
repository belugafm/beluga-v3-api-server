import * as vs from "../../../../domain/validation"

import {
    ChannelCommandRepository,
    ChannelQueryRepository,
    MessageCommandRepository,
    MessageQueryRepository,
    TransactionRepository,
    UserCommandRepository,
    UserQueryRepository,
} from "../../../repositories"
import { DeleteMessageApplication, ErrorCodes } from "../../../../application/message/DeleteMessage"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["id"] as const, {
    id: {
        description: ["削除するメッセージのID"],
        examples: ["99999"],
        required: true,
        validator: vs.messageId(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.DoNotHavePermission, "invalid_auth", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["メッセージを削除する権限がありません"],
            hint: ["信用レベルを上げると削除できるようになります"],
            code: "do_not_have_permission",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.DeleteMessage,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [
        AuthenticationMethods.OAuth,
        AuthenticationMethods.AccessToken,
        AuthenticationMethods.Cookie,
    ],
    acceptedScopes: {},
    description: ["チャンネルまたはスレッドに投稿します"],
}

type ReturnType = Promise<boolean>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const succeeded = await new DeleteMessageApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new ChannelQueryRepository(transactionSession),
                new ChannelCommandRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
            ).delete({
                messageId: args.id,
                requestUserId: authUser.id,
            })
            return succeeded
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else {
                raise(errors["internal_error"], error)
            }
        } else if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
