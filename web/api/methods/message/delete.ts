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
import { ErrorCodes, PostMessageApplication } from "../../../../application/message/PostMessage"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MessageEntity } from "../../../../domain/entity/Message"
import { MethodIdentifiers } from "../../identifier"
import config from "../../../../config/app"

export const argumentSpecs = defineArguments(["id"] as const, {
    id: {
        description: ["削除するメッセージのID"],
        examples: ["99999"],
        required: true,
        validator: vs.messageId(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.DoNotHavePermission, "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["このチャンネルに投稿する権限がありません"],
            hint: ["信用レベルを上げると作れるようになります"],
            code: "do_not_have_permission",
        },
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

type ReturnType = Promise<MessageEntity>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["internal_error"])
    }
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const message = await new PostMessageApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new ChannelQueryRepository(transactionSession),
                new ChannelCommandRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
            ).post({
                text: args.text,
                channelId: args.channel_id,
                threadId: args.thread_id,
                userId: authUser.id,
            })
            return message
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else if (error.code === ErrorCodes.TextLengthNotMeetPolicy) {
                raise(errors["text_length_not_meet_policy"], error)
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
