import config from "../../config/app"
import { LikeJsonObjectT, MessageId, UserId } from "../types"
import { IsDate, IsEntityId, IsInteger, IsMessageId, IsUserId } from "../validation/decorators"

import { Entity } from "./Entity"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidMessageId: "invalid_message_id",
    InvalidUserId: "invalid_user_id",
    InvalidCount: "invalid_count",
    InvalidUpdatedAt: "invalid_udpated_at",
} as const

export class LikeEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsEntityId({ errorCode: ErrorCodes.InvalidId })
    id: MessageId

    @IsMessageId({ errorCode: ErrorCodes.InvalidMessageId })
    messageId: MessageId

    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsInteger({ minValue: 1, maxValue: config.message.like.max_count }, { errorCode: ErrorCodes.InvalidCount })
    count: number

    @IsDate({ errorCode: ErrorCodes.InvalidUpdatedAt })
    updatedAt: Date

    constructor(params: {
        id: LikeEntity["id"]
        messageId: LikeEntity["messageId"]
        userId: LikeEntity["userId"]
        count: LikeEntity["count"]
        updatedAt: LikeEntity["updatedAt"]
    }) {
        super()
        this.id = params.id
        this.messageId = params.messageId
        this.userId = params.userId
        this.count = params.count
        this.updatedAt = params.updatedAt
    }
    toJsonObject(): LikeJsonObjectT {
        return {
            id: this.id,
            message_id: this.messageId,
            message: null,
            user_id: this.userId,
            user: null,
            updated_at: this.updatedAt,
            count: this.count,
        }
    }
}
