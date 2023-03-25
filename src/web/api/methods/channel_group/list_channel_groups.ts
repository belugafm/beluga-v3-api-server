import * as vs from "../../../../domain/validation"

import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { SortBy, SortOrder } from "../../../../domain/repository/query/ChannelGroup"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { ChannelGroupQueryRepository } from "../../../repositories"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { ChannelGroupJsonObjectT } from "../../../../domain/types"

export const argumentSpecs = defineArguments(["id"] as const, {
    id: {
        description: [],
        examples: ["123456"],
        required: true,
        validator: vs.ChannelGroupIdValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    ["not_found", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        not_found: {
            description: ["指定されたチャンネルグループが見つかりませんでした"],
            hint: [],
            code: "not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ListChannelGroupsInChannelGroup,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson, ContentTypes.ApplicationFormUrlEncoded],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: [
        "チャンネルグループに属しているチャンネルグループの一覧を取得します",
        "取得できる範囲は直下の階層のみです",
    ],
}

type ReturnType = Promise<ChannelGroupJsonObjectT[]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors): ReturnType => {
    try {
        const channelGroups = await new ChannelGroupQueryRepository().listChannelGroups(
            args.id,
            SortBy.CreatedAt,
            SortOrder.Ascending
        )
        return channelGroups.map((channelGroup) => channelGroup.toJsonObject())
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
