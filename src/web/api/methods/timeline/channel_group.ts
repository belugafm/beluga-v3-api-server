import * as vs from "../../../../domain/validation"

import {
    ChannelGroupTimelineQueryRepository,
    MessageQueryRepository,
} from "../../../../infrastructure/prisma/repository"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { SortOrder } from "../../../../domain/repository/query/ChannelGroupTimeline"
import { includeMessageRelations } from "../../relations/message"
import { MessageJsonObjectT } from "../../../../domain/types"

export const argumentSpecs = defineArguments(
    ["channel_group_id", "since_id", "max_id", "limit", "sort_order"] as const,
    {
        channel_group_id: {
            description: ["チャンネルグループID"],
            examples: ["123456"],
            required: true,
            validator: vs.ChannelGroupIdValidator(),
        },
        max_id: {
            description: ["このID以前の投稿を取得します", "`max_id`の投稿は含まれません"],
            examples: ["123456"],
            required: false,
            validator: vs.IntegerValidator(),
        },
        since_id: {
            description: ["このID以降の投稿を取得します", "`since_id`の投稿は含まれません"],
            examples: ["123456"],
            required: false,
            validator: vs.IntegerValidator(),
        },
        limit: {
            description: ["取得する投稿の上限"],
            examples: ["50"],
            required: false,
            validator: vs.IntegerValidator({ minValue: 1, maxValue: 100 }),
        },
        sort_order: {
            description: ["取得する投稿のソート順"],
            examples: ["descending"],
            required: false,
            validator: vs.StringValidator(),
        },
    }
)

export const expectedErrorSpecs = defineErrors(
    ["not_found", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        not_found: {
            description: ["指定されたチャンネルグループが見つかりませんでした"],
            hint: [],
            argument: "channel_group_id",
            code: "not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ChannelGroupTimeline,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["チャンネルグループのタイムラインを取得します"],
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
        const messageIds = await new ChannelGroupTimelineQueryRepository().listMessageId({
            channelGroupId: args.channel_group_id,
            maxId: args.max_id,
            sinceId: args.since_id,
            limit: args.limit ? args.limit : 30,
            sortOrder: getSortOrder(args.sort_order),
        })
        const messageQueryRepository = new MessageQueryRepository()
        const messageObjs = []
        for (const messageId of messageIds) {
            const message = await messageQueryRepository.findById(messageId)
            if (message) {
                const messageObj = await includeMessageRelations(message.toJsonObject(), authUser)
                if (messageObj.user == null) {
                    continue
                }
                if (messageObj.channel == null) {
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
