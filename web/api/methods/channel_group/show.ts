import * as vs from "../../../../domain/validation"

import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { ChannelGroupEntity } from "../../../../domain/entity/ChannelGroup"
import { ChannelGroupQueryRepository } from "../../../repositories"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["unique_name", "id"] as const, {
    unique_name: {
        description: [],
        examples: ["0TI4SjhQJLy2"],
        required: false,
        validator: vs.channelGroup.uniqueName(),
    },
    id: {
        description: [],
        examples: ["123456"],
        required: false,
        validator: vs.channelGroupId(),
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
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [
        AuthenticationMethods.OAuth,
        AuthenticationMethods.AccessToken,
        AuthenticationMethods.Cookie,
    ],
    acceptedScopes: {},
    description: ["チャンネルグループの情報を取得します"],
}

type ReturnType = Promise<ChannelGroupEntity | null>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors): ReturnType => {
    if (args.unique_name == null && args.id == null) {
        raise(errors["missing_argument"])
    }
    try {
        if (args.unique_name) {
            return await new ChannelGroupQueryRepository().findByUniqueName(args.unique_name)
        }
        if (args.id) {
            return await new ChannelGroupQueryRepository().findById(args.id)
        }
        throw new Error()
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
