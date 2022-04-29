import { ChannelId, ChannelReadStateId, MessageId, UserId } from "../types"
import { IsChannelId, IsMessageId, IsReadStateId, IsUserId } from "../validation/decorators"

import { Entity } from "./Entity"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidChannelId: "invalid_channel_id",
    InvalidUserId: "invalid_user_id",
    InvalidLastMessageId: "invalid_last_message_id",
} as const

export class ChannelReadStateEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsReadStateId({ errorCode: ErrorCodes.InvalidId })
    id: ChannelReadStateId

    @IsChannelId({ errorCode: ErrorCodes.InvalidChannelId })
    channelId: ChannelId

    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsMessageId({ errorCode: ErrorCodes.InvalidLastMessageId })
    lastMessageId: MessageId

    constructor(params: {
        id: ChannelReadStateEntity["id"]
        channelId: ChannelReadStateEntity["channelId"]
        userId: ChannelReadStateEntity["userId"]
        lastMessageId: ChannelReadStateEntity["lastMessageId"]
    }) {
        super()
        this.id = params.id
        this.channelId = params.channelId
        this.userId = params.userId
        this.lastMessageId = params.lastMessageId
    }
    toResponseObject() {
        return {
            id: this.id,
            channel_id: this.channelId,
            user_id: this.userId,
            last_message_id: this.lastMessageId,
            last_message: null,
        }
    }
}
