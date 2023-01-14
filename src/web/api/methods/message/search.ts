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
import { SortBy, SortOrder } from "../../../../domain/repository/query/Message"

export const argumentSpecs = defineArguments(
    [
        "text",
        "channel_id",
        "user_id",
        "since_id",
        "max_id",
        "since_date",
        "until_date",
        "limit",
        "sort_by",
        "sort_order",
    ] as const,
    {
        text: {
            description: ["検索する文字列"],
            examples: ["beluga"],
            required: true,
            validator: vs.message.TextValidator(),
        },
        channel_id: {
            description: ["検索対象のチャンネルID", "指定しない場合全チャンネルが検索の対象になる"],
            examples: ["123456"],
            required: false,
            validator: vs.ChannelIdValidator(),
        },
        user_id: {
            description: ["検索対象のユーザーID", "指定しない場合全ユーザーが検索の対象になる"],
            examples: ["123456"],
            required: false,
            validator: vs.UserIdValidator(),
        },
        since_id: {
            description: ["このメッセージIDよりも大きなIDを持つメッセージが検索対象になる"],
            examples: ["123456"],
            required: false,
            validator: vs.MessageIdValidator(),
        },
        max_id: {
            description: ["このメッセージIDよりも小さなIDを持つメッセージが検索対象になる"],
            examples: ["123456"],
            required: false,
            validator: vs.MessageIdValidator(),
        },
        since_date: {
            description: ["この時刻よりも新しいメッセージが検索対象になる", "unixtimeで指定してください"],
            examples: ["1673686304"],
            required: false,
            validator: vs.IntegerValidator(),
        },
        until_date: {
            description: ["この時刻よりも新しいメッセージが検索対象になる", "unixtimeで指定してください"],
            examples: ["1673686304"],
            required: false,
            validator: vs.IntegerValidator(),
        },
        limit: {
            description: ["取得する投稿数"],
            examples: ["30"],
            required: false,
            validator: vs.IntegerValidator(),
        },
        sort_by: {
            description: ["ソートの基準"],
            examples: [SortBy.CreatedAt],
            required: false,
            validator: vs.StringValidator(),
        },
        sort_order: {
            description: ["ソート順"],
            examples: [SortOrder.Ascending, SortOrder.Descending],
            required: false,
            validator: vs.StringValidator(),
        },
    }
)

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
    url: MethodIdentifiers.SearchMessage,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["メッセージの情報を取得します"],
}

type ReturnType = Promise<MessageJsonObjectT[]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    try {
        const messages = await new MessageQueryRepository().search({
            text: args.text,
            channelId: args.channel_id,
            userId: args.user_id,
            sinceId: args.since_id,
            maxId: args.max_id,
            sinceDate: args.since_date,
            untilDate: args.until_date,
            limit: args.limit,
            // @ts-ignore
            sortBy: args.sort_by,
            // @ts-ignore
            sortOrder: args.sort_order,
        })
        const messageObjList = messages.map((message) => {
            return message.toJsonObject()
        })
        const ret = []
        for (const messageObj of messageObjList) {
            ret.push(await includeMessageRelations(messageObj, authUser))
        }
        return ret
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
