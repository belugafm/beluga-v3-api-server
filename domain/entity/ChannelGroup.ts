import * as vn from "../validation"

import { ChannelGroupdId, ChannelId, UserId } from "../types"

import { Entity } from "./Entity"
import config from "../../config/app"
import crypto from "crypto"
import { validateBy } from "../validation/validateBy"

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
} as const

export class ChannelGroupEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @validateBy(vn.channelGroupId(), { errorCode: ErrorCodes.InvalidId })
    id: ChannelId

    @validateBy(vn.channelGroup.name(), { errorCode: ErrorCodes.InvalidName })
    name: string

    // チャンネルを識別する文字列
    // URLで使われる
    // https://beluga/channel/{uniqueName}
    @validateBy(vn.channelGroup.uniqueName(), { errorCode: ErrorCodes.InvalidUniqueName })
    uniqueName: string

    @validateBy(vn.integer({ minValue: 0 }), { errorCode: ErrorCodes.InvalidLevel })
    level: number

    @validateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidParentId })
    parentId: ChannelGroupdId

    @validateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidCreatedBy })
    createdBy: UserId

    @validateBy(vn.date(), { errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @validateBy(vn.integer({ minValue: 0 }), { errorCode: ErrorCodes.InvalidMessageCount })
    messageCount: number

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
    }
    toResponseObject() {
        return {
            id: this.id,
            name: this.name,
            unique_name: this.uniqueName,
            parent_id: this.parentId,
            level: this.level,
            created_by: this.createdBy,
            created_at: this.createdAt,
            message_count: this.messageCount,
        }
    }
    static generateUniqueName(): string {
        return generateRandomName(config.channel.unique_name.default_length)
    }
}
