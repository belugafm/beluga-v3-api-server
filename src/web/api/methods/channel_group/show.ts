import * as vs from "../../../../domain/validation"

import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ChannelGroupQueryRepository } from "../../../repositories"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { includeChannelGroupRelations } from "../../relations/channel_group"
import { ChannelGroupJsonObjectT } from "../../../../domain/types"

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
            description: ["指定されたチャンネルグループが見つかりませんでした"],
            hint: [],
            code: "not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ShowChannelGroup,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson, ContentTypes.ApplicationFormUrlEncoded],
    userAuthenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["チャンネルグループの情報を取得します"],
}

type ReturnType = Promise<ChannelGroupJsonObjectT | null>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors): ReturnType => {
    if (args.unique_name == null && args.id == null) {
        raise(errors["missing_argument"])
    }
    try {
        if (args.unique_name) {
            const channelGroup = await new ChannelGroupQueryRepository().findByUniqueName(args.unique_name)
            if (channelGroup) {
                return includeChannelGroupRelations(channelGroup.toJsonObject())
            }
        }
        if (args.id) {
            const channelGroup = await new ChannelGroupQueryRepository().findById(args.id)
            if (channelGroup) {
                return includeChannelGroupRelations(channelGroup.toJsonObject())
            }
        }
        return null
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
