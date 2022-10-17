import { FavoriteJsonObjectT, MessageId, UserId } from "../types"
import { IsDate, IsEntityId, IsMessageId, IsUserId } from "../validation/decorators"

import { Entity } from "./Entity"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidMessageId: "invalid_message_id",
    InvalidUserId: "invalid_user_id",
    InvalidCount: "invalid_count",
    InvalidCreatedAt: "invalid_created_at",
} as const

export class FavoriteEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsEntityId({ errorCode: ErrorCodes.InvalidId })
    id: MessageId

    @IsMessageId({ errorCode: ErrorCodes.InvalidMessageId })
    messageId: MessageId

    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsDate({ errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    constructor(params: {
        id: FavoriteEntity["id"]
        messageId: FavoriteEntity["messageId"]
        userId: FavoriteEntity["userId"]
        createdAt: FavoriteEntity["createdAt"]
    }) {
        super()
        this.id = params.id
        this.messageId = params.messageId
        this.userId = params.userId
        this.createdAt = params.createdAt
    }
    toJsonObject(): FavoriteJsonObjectT {
        return {
            id: this.id,
            message_id: this.messageId,
            message: null,
            user_id: this.userId,
            user: null,
            created_at: this.createdAt,
        }
    }
}
