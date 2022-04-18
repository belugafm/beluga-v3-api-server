import * as vn from "../validation"

import { ChannelId, MessageId, UserId } from "../types"

import { Entity } from "./Entity"
import { validateBy } from "../validation/validateBy"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidChannelId: "invalid_channel_id",
    InvalidUserId: "invalid_user_id",
    InvalidCreatedAt: "invalid_created_at",
    InvalidFavoriteCount: "invalid_favorite_count",
    InvalidLikeCount: "invalid_like_count",
    InvalidReplyCount: "invalid_reply_count",
    InvalidText: "invalid_text",
    InvalidThreadId: "invalid_thread_id",
    InvalidDeleted: "invalid_deleted",
} as const

export class MessageEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @validateBy(vn.messageId(), { errorCode: ErrorCodes.InvalidId })
    id: MessageId

    @validateBy(vn.channelId(), { errorCode: ErrorCodes.InvalidChannelId })
    channelId: ChannelId

    @validateBy(vn.userId(), { errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @validateBy(vn.message.text(), { errorCode: ErrorCodes.InvalidText })
    text: string

    @validateBy(vn.date(), { errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @validateBy(vn.integer({ minValue: 0 }), { errorCode: ErrorCodes.InvalidFavoriteCount })
    favoriteCount: number

    @validateBy(vn.integer({ minValue: 0 }), { errorCode: ErrorCodes.InvalidLikeCount })
    likeCount: number

    @validateBy(vn.integer({ minValue: 0 }), { errorCode: ErrorCodes.InvalidReplyCount })
    replyCount: number

    @validateBy(vn.messageId(), { nullable: true, errorCode: ErrorCodes.InvalidThreadId })
    threadId: MessageId | null

    @validateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidDeleted })
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
    }
    toResponseObject() {
        return {
            id: this.id,
            channel_id: this.channelId,
            channel: {},
            user_id: this.userId,
            user: {},
            text: this.text,
            created_at: this.createdAt,
            favorite_count: this.favoriteCount,
            like_count: this.likeCount,
            reply_count: this.replyCount,
            thread_id: this.threadId,
            deleted: this.deleted,
            entities: {
                channels: [],
                messages: [],
            },
        }
    }
}
