import { ChannelId, MessageId, MessageJsonObjectT, UserId } from "../types"
import {
    IsBoolean,
    IsChannelId,
    IsDate,
    IsInteger,
    IsMessageId,
    IsMessageText,
    IsMessageTextStyle,
    IsUserId,
} from "../validation/decorators"

import { Entity } from "./Entity"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidChannelId: "invalid_channel_id",
    InvalidUserId: "invalid_user_id",
    InvalidCreatedAt: "invalid_created_at",
    InvalidFavoriteCount: "invalid_favorite_count",
    InvalidLikeCount: "invalid_like_count",
    InvalidReplyCount: "invalid_reply_count",
    InvalidText: "invalid_text",
    InvalidTextStyle: "invalid_text_style",
    InvalidThreadId: "invalid_thread_id",
    InvalidDeleted: "invalid_deleted",
} as const

export class MessageEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsMessageId({ errorCode: ErrorCodes.InvalidId })
    id: MessageId

    @IsChannelId({ errorCode: ErrorCodes.InvalidChannelId })
    channelId: ChannelId

    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsMessageText({ errorCode: ErrorCodes.InvalidText })
    text: string

    @IsMessageTextStyle({ nullable: true, errorCode: ErrorCodes.InvalidTextStyle })
    textStyle: string | null

    @IsDate({ errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidFavoriteCount })
    favoriteCount: number

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidLikeCount })
    likeCount: number

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidReplyCount })
    replyCount: number

    @IsMessageId({ nullable: true, errorCode: ErrorCodes.InvalidThreadId })
    threadId: MessageId | null

    @IsBoolean({ errorCode: ErrorCodes.InvalidDeleted })
    deleted: boolean

    constructor(
        params: {
            id: MessageEntity["id"]
            channelId: MessageEntity["channelId"]
            userId: MessageEntity["userId"]
            text: MessageEntity["text"]
            createdAt: MessageEntity["createdAt"]
            favoriteCount: MessageEntity["favoriteCount"]
            likeCount: MessageEntity["likeCount"]
            replyCount: MessageEntity["replyCount"]
        } & Partial<MessageEntity>
    ) {
        super()
        this.id = params.id
        this.channelId = params.channelId
        this.userId = params.userId
        this.text = params.text
        this.createdAt = params.createdAt
        this.favoriteCount = params.favoriteCount
        this.likeCount = params.likeCount
        this.replyCount = params.replyCount
        this.threadId = params.threadId != null ? params.threadId : null
        this.deleted = params.deleted != null ? params.deleted : false
        this.textStyle = params.textStyle != null ? params.textStyle : null
    }
    toJsonObject(): MessageJsonObjectT {
        return {
            id: this.id,
            channel_id: this.channelId,
            channel: null,
            user_id: this.userId,
            user: null,
            text: this.deleted ? null : this.text,
            created_at: this.createdAt,
            favorite_count: this.favoriteCount,
            like_count: this.likeCount,
            reply_count: this.replyCount,
            thread_id: this.threadId,
            deleted: this.deleted,
            entities: {
                channel_groups: this.deleted ? [] : [],
                channels: this.deleted ? [] : [],
                messages: this.deleted ? [] : [],
                files: this.deleted ? [] : [],
                urls: this.deleted ? [] : [],
                style: this.deleted || this.textStyle == null ? [] : JSON.parse(this.textStyle),
            },
        }
    }
}
