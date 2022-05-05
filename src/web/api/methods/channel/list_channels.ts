import * as vs from "../../../../domain/validation"

import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { SortBy, SortOrder } from "../../../../domain/repository/query/Channel"

import { ChannelEntity } from "../../../../domain/entity/Channel"
import { ChannelQueryRepository } from "../../../repositories"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["sort_by", "sort_order"] as const, {
    sort_by: {
        description: ["ソートの基準"],
        examples: ["message_count"],
        required: true,
        validator: vs.string(),
    },
    sort_order: {
        description: ["ソート順"],
        examples: ["descending"],
        required: true,
        validator: vs.string(),
    },
})

export const expectedErrorSpecs = defineErrors(["internal_error", "unexpected_error"] as const, argumentSpecs, {
    internal_error: new InternalErrorSpec(),
    unexpected_error: new UnexpectedErrorSpec(),
})

export const facts: MethodFacts = {
    url: MethodIdentifiers.ListAllChannels,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["存在する全てのチャンネルの一覧を取得します"],
}

type ReturnType = Promise<ChannelEntity[]>

function getSortOrder(sortOrderString?: string): typeof SortOrder[keyof typeof SortOrder] {
    if (sortOrderString == SortOrder.Descending) {
        return SortOrder.Descending
    }
    if (sortOrderString == SortOrder.Ascending) {
        return SortOrder.Ascending
    }
    return SortOrder.Descending
}

function getSortBy(sortByString?: string): typeof SortBy[keyof typeof SortBy] {
    if (sortByString == SortBy.CreatedAt) {
        return SortBy.CreatedAt
    }
    if (sortByString == SortBy.MessageCount) {
        return SortBy.MessageCount
    }
    return SortBy.CreatedAt
}

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    try {
        return await new ChannelQueryRepository().list(getSortBy(args.sort_by), getSortOrder(args.sort_order))
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
