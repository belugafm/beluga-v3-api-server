import { ChannelGroupJsonObjectT, ChannelGroupdId, MessageId, UserId } from "../types"
import {
    IsChannelGroupDescription,
    IsChannelGroupId,
    IsChannelGroupName,
    IsChannelGroupUniqueName,
    IsDate,
    IsInteger,
    IsMessageId,
    IsUrl,
    IsUserId,
} from "../validation/decorators"

import { Entity } from "./Entity"
import config from "../../config/app"
import crypto from "crypto"

export const generateRandomName = (length: number): string => {
    const S = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return Array.from(crypto.randomFillSync(new Uint8Array(length)))
        .map((n) => S[n % S.length])
        .join("")
}

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidName: "invalid_name",
    InvalidUniqueName: "invalid_unique_name",
    InvalidParentId: "invalid_parent_id",
    InvalidLevel: "invalid_level",
    InvalidCreatedBy: "invalid_created_by",
    InvalidCreatedAt: "invalid_created_at",
    InvalidMessageCount: "invalid_message_count",
    InvalidImageUrl: "invalid_image_url",
    InvalidDescription: "invalid_description",
    InvalidLastMessageId: "invalid_last_message_id",
    InvalidLastMessageCreatedAt: "invalid_last_message_created_at",
} as const

export class ChannelGroupEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsChannelGroupId({ errorCode: ErrorCodes.InvalidId })
    id: ChannelGroupdId

    @IsChannelGroupName({ errorCode: ErrorCodes.InvalidName })
    name: string

    // チャンネルを識別する文字列
    // URLで使われる
    // https://beluga/channel/{uniqueName}
    @IsChannelGroupUniqueName({ errorCode: ErrorCodes.InvalidUniqueName })
    uniqueName: string

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidLevel })
    level: number

    @IsChannelGroupId({ nullable: true, errorCode: ErrorCodes.InvalidParentId })
    parentId: ChannelGroupdId | null

    @IsUserId({ errorCode: ErrorCodes.InvalidCreatedBy })
    createdBy: UserId

    @IsDate({ errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidMessageCount })
    messageCount: number

    @IsUrl({ nullable: true, errorCode: ErrorCodes.InvalidImageUrl })
    imageUrl: string | null

    @IsChannelGroupDescription({ nullable: true, errorCode: ErrorCodes.InvalidDescription })
    description: string | null

    @IsMessageId({ nullable: true, errorCode: ErrorCodes.InvalidLastMessageId })
    lastMessageId: MessageId | null

    @IsDate({ nullable: true, errorCode: ErrorCodes.InvalidLastMessageCreatedAt })
    lastMessageCreatedAt: Date | null

    constructor(
        params: {
            id: ChannelGroupEntity["id"]
            name: ChannelGroupEntity["name"]
            uniqueName: ChannelGroupEntity["uniqueName"]
            parentId: ChannelGroupEntity["parentId"]
            level: ChannelGroupEntity["level"]
            createdBy: ChannelGroupEntity["createdBy"]
            createdAt: ChannelGroupEntity["createdAt"]
        } & Partial<ChannelGroupEntity>
    ) {
        super()
        this.id = params.id
        this.name = params.name
        this.uniqueName = params.uniqueName
        this.parentId = params.parentId
        this.level = params.level
        this.createdBy = params.createdBy
        this.createdAt = params.createdAt
        this.messageCount = params.messageCount != null ? params.messageCount : 0
        this.imageUrl = params.imageUrl != null ? params.imageUrl : null
        this.lastMessageId = params.lastMessageId != null ? params.lastMessageId : null
        this.lastMessageCreatedAt = params.lastMessageCreatedAt != null ? params.lastMessageCreatedAt : null
        this.description = params.description != null ? params.description : null
    }
    toJsonObject(): ChannelGroupJsonObjectT {
        return {
            id: this.id,
            name: this.name,
            unique_name: this.uniqueName,
            parent_id: this.parentId,
            parent: null,
            level: this.level,
            user_id: this.createdBy,
            user: null,
            created_at: this.createdAt,
            message_count: this.messageCount,
            description: this.description,
            image_url: this.imageUrl,
        }
    }
    static generateUniqueName(): string {
        return generateRandomName(config.channel.unique_name.default_length)
    }
}
