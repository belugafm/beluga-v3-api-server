import * as vs from "../../../../domain/validation"

import { ChannelTimelineQueryRepository } from "../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { SortOrder } from "../../../../domain/repository/query/ChannelTimeline"
import { MessageJsonObjectT } from "../../../../domain/types"
import { includeMessageRelations } from "../../relations/message"
import { ChannelDebugTimelineApplication } from "../../../../application/timeline/ChannelDebug"

export const argumentSpecs = defineArguments(["channel_id", "since_id", "max_id", "limit", "sort_order"] as const, {
    channel_id: {
        description: ["チャンネルID"],
        examples: ["123456"],
        required: true,
        validator: vs.channelId(),
    },
    max_id: {
        description: ["このID以前の投稿を取得します", "`max_id`の投稿は含まれません"],
        examples: ["123456"],
        required: false,
        validator: vs.integer(),
    },
    since_id: {
        description: ["このID以降の投稿を取得します", "`since_id`の投稿は含まれません"],
        examples: ["123456"],
        required: false,
        validator: vs.integer(),
    },
    limit: {
        description: ["取得する投稿の上限"],
        examples: ["50"],
        required: false,
        validator: vs.integer({ minValue: 1, maxValue: 100 }),
    },
    sort_order: {
        description: ["取得する投稿のソート順"],
        examples: ["descending"],
        required: false,
        validator: vs.string(),
    },
})

export const expectedErrorSpecs = defineErrors(
    ["not_found", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        not_found: {
            description: ["指定されたチャンネルが見つかりませんでした"],
            hint: [],
            argument: "channel_id",
            code: "not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: "timeline/channel_debug",
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["チャンネルのタイムラインを取得します"],
}

type ReturnType = Promise<MessageJsonObjectT[]>

function getSortOrder(sortOrderString?: string) {
    if (sortOrderString == SortOrder.Descending) {
        return SortOrder.Descending
    }
    if (sortOrderString == SortOrder.Ascending) {
        return SortOrder.Ascending
    }
    return SortOrder.Descending
}

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    try {
        const messages = await new ChannelDebugTimelineApplication(new ChannelTimelineQueryRepository()).listMessage({
            channelId: args.channel_id,
            maxId: args.max_id,
            sinceId: args.since_id,
            limit: args.limit ? args.limit : 30,
            sortOrder: getSortOrder(args.sort_order),
        })

        const messageObjs = []
        for (const message of messages) {
            if (message) {
                const messageObj = await includeMessageRelations(message.toJsonObject(), authUser)
                if (messageObj.user == null) {
                    continue
                }
                messageObjs.push(messageObj)
            }
        }
        return messageObjs
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
