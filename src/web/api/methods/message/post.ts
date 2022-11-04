import * as vs from "../../../../domain/validation"

import {
    ChannelCommandRepository,
    ChannelGroupCommandRepository,
    ChannelGroupQueryRepository,
    ChannelQueryRepository,
    FileQueryRepository,
    MessageCommandRepository,
    MessageQueryRepository,
    TransactionRepository,
    UserCommandRepository,
    UserQueryRepository,
} from "../../../repositories"
import { ErrorCodes, PostMessageApplication } from "../../../../application/message/PostMessage"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ChannelGroupTimelineCommandRepository } from "../../../../infrastructure/prisma/repository"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MessageEntity } from "../../../../domain/entity/Message"
import { MethodIdentifiers } from "../../identifier"
import config from "../../../../config/app"
import { MessageJsonObjectT } from "../../../../domain/types"

export const argumentSpecs = defineArguments(["text", "text_style", "channel_id", "thread_id"] as const, {
    text: {
        description: ["投稿内容"],
        examples: ["おはよう"],
        required: true,
        validator: vs.message.text(),
    },
    text_style: {
        description: ["文字装飾"],
        examples: [],
        required: false,
        validator: vs.message.textStyle(),
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
        "invalid_text",
        "invalid_channel_id",
        "invalid_thread_id",
        "argument_missing",
        "invalid_auth",
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
        invalid_text: {
            description: ["`text`が不正です"],
            hint: [],
            argument: "text",
            code: "invalid_text",
        },
        invalid_channel_id: {
            description: ["`channel_id`が不正です"],
            hint: [],
            argument: "channel_id",
            code: "invalid_channel_id",
        },
        invalid_thread_id: {
            description: ["`thread_id`が不正です"],
            hint: [],
            argument: "thread_id",
            code: "invalid_thread_id",
        },
        argument_missing: {
            description: ["`channelId`と`threadId`はどちらかを必ず指定してください"],
            hint: [],
            code: "argument_missing",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.PostMessage,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson, ContentTypes.ApplicationFormUrlEncoded],
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

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors, authUser): Promise<MessageJsonObjectT> => {
        if (authUser == null) {
            raise(errors["invalid_auth"])
        }
        if (args.channel_id == null && args.thread_id == null) {
            raise(errors["argument_missing"])
        }
        try {
            const transaction = await TransactionRepository.new<Promise<MessageEntity>>()
            const message = await transaction.$transaction(async (transactionSession) => {
                return await new PostMessageApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new ChannelQueryRepository(transactionSession),
                    new ChannelCommandRepository(transactionSession),
                    new ChannelGroupQueryRepository(transactionSession),
                    new ChannelGroupCommandRepository(transactionSession),
                    new MessageQueryRepository(transactionSession),
                    new MessageCommandRepository(transactionSession),
                    new FileQueryRepository(transactionSession),
                    new ChannelGroupTimelineCommandRepository(transactionSession)
                ).post({
                    text: args.text,
                    textStyle: args.text_style,
                    channelId: args.channel_id,
                    threadId: args.thread_id,
                    userId: authUser.id,
                })
            })
            return message.toJsonObject()
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
    }
)
