import * as vs from "../../../../domain/validation"

import { ChannelGroupQueryRepository, ChannelQueryRepository } from "../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { ChannelJsonObjectT } from "../../../../domain/types"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["unique_name", "id"] as const, {
    unique_name: {
        description: [],
        examples: ["0TI4SjhQJLy2"],
        required: false,
        validator: vs.channelGroup.UniqueNameValidator(),
    },
    id: {
        description: [],
        examples: ["123456"],
        required: false,
        validator: vs.ChannelGroupIdValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    ["missing_argument", "not_found", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        missing_argument: {
            description: ["引数を指定してください"],
            hint: ["`unique_name`と`id`のどちらかを必ず指定してください"],
            code: "missing_argument",
        },
        not_found: {
            description: ["指定されたチャンネルが見つかりませんでした"],
            hint: [],
            code: "not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ShowChannel,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson, ContentTypes.ApplicationFormUrlEncoded],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["チャンネルの情報を取得します"],
}

type ReturnType = Promise<ChannelJsonObjectT | null>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors): ReturnType => {
    if (args.unique_name == null && args.id == null) {
        raise(errors["missing_argument"])
    }
    try {
        const channel = await (async () => {
            if (args.unique_name) {
                return await new ChannelQueryRepository().findByUniqueName(args.unique_name)
            }
            if (args.id) {
                return await new ChannelQueryRepository().findById(args.id)
            }
            throw new Error()
        })()
        if (channel == null) {
            return null
        }
        const channelObj = channel.toJsonObject()
        const parentChannelGroupId = await new ChannelGroupQueryRepository().findById(channel.parentChannelGroupId)
        if (parentChannelGroupId) {
            channelObj.parent_channel_group = parentChannelGroupId.toJsonObject()
        }
        return channelObj
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
