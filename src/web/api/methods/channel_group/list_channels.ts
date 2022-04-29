import * as vs from "../../../../domain/validation"

import {
    ChannelGroupQueryRepository,
    ChannelReadStateQueryRepository,
    MessageQueryRepository,
} from "../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { SortBy, SortOrder } from "../../../../domain/repository/query/ChannelGroup"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { ChannelJsonObjectT } from "../../../../domain/types"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["id"] as const, {
    id: {
        description: [],
        examples: ["123456"],
        required: true,
        validator: vs.channelGroupId(),
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
    url: MethodIdentifiers.ListChannelsInChannelGroup,
    httpMethod: HttpMethods.GET,
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
    description: ["チャンネルグループに属しているチャンネルの一覧を取得します", "取得できる範囲は直下の階層のみです"],
}

type ReturnType = Promise<ChannelJsonObjectT[]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (authUser == null) {
        raise(errors["internal_error"])
    }
    try {
        const channelList = await new ChannelGroupQueryRepository().listChannels(
            args.id,
            SortBy.CreatedAt,
            SortOrder.Ascending
        )
        const channelObjList = []
        const readStateRepository = new ChannelReadStateQueryRepository()
        const messageRepository = new MessageQueryRepository()
        for (const channel of channelList) {
            const readState = await readStateRepository.find(channel.id, authUser.id)
            const channelObj = channel.toJsonObject()
            if (channel.lastMessageId) {
                const lastMessage = await messageRepository.findById(channel.lastMessageId)
                if (lastMessage) {
                    channelObj.last_message = lastMessage.toJsonObject()
                }
            }
            if (readState) {
                const lastMessage = await messageRepository.findById(readState.lastMessageId)
                if (lastMessage) {
                    channelObj.read_state = readState.toJsonObject()
                    channelObj.read_state.last_message = lastMessage.toJsonObject()
                }
            }
            channelObjList.push(channelObj)
        }
        return channelObjList
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
