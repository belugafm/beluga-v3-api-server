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

export const argumentSpecs = defineArguments(["text", "channel_id", "thread_id"] as const, {
    text: {
        description: ["投稿内容"],
        examples: ["おはよう"],
        required: true,
        validator: vs.message.text(),
    },
    channel_id: {
        description: ["チャンネルID"],
        examples: ["123456"],
        required: false,
        validator: vs.channelId(),
    },
    thread_id: {
        description: ["スレッドID"],
        examples: ["123456"],
        required: false,
        validator: vs.messageId(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.DoNotHavePermission,
        ErrorCodes.RateLimitExceeded,
        ErrorCodes.TextLengthNotMeetPolicy,
        "argument_missing",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["このチャンネルに投稿する権限がありません"],
            hint: ["信用レベルを上げると作れるようになります"],
            code: "do_not_have_permission",
        },
        rate_limit_exceeded: {
            description: ["投稿の間隔が短すぎます"],
            hint: ["前回の投稿からしばらく時間をおいて投稿してください"],
            code: "rate_limit_exceeded",
        },
        text_length_not_meet_policy: {
            description: ["投稿の文字数を確認してください"],
            hint: [
                `投稿の文字数は${config.message.text.min_length}〜${config.message.text.max_length}文字以内にしてください`,
            ],
            code: "text_length_not_meet_policy",
        },
        argument_missing: {
            description: ["`channelId`と`threadId`はどちらかを必ず指定してください"],
            hint: [],
            code: "argument_missing",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.PostMessage,
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
    if (args.channel_id == null && args.thread_id == null) {
        raise(errors["argument_missing"])
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
