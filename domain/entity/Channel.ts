import * as vn from "../validation"

import { ChannelGroupdId, ChannelId, UserId } from "../types"

import { Entity } from "./Entity"
import { ValidateBy } from "../validation/ValidateBy"
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
    InvalidChanelGroupId: "invalid_channel_group_id",
    InvalidCreatedBy: "invalid_created_by",
    InvalidCreatedAt: "invalid_created_at",
    InvalidStatusesCount: "invalid_statuses_count",
} as const

export class ChannelEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidId })
    id: ChannelId

    @ValidateBy(vn.channel.name(), { errorCode: ErrorCodes.InvalidName })
    name: string

    // チャンネルを識別する文字列
    // URLで使われる
    // https://beluga/channel/{uniqueName}
    @ValidateBy(vn.channel.uniqueName(), { errorCode: ErrorCodes.InvalidUniqueName })
    uniqueName: string

    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidChanelGroupId })
    parentChannelGroupId: ChannelGroupdId

    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidCreatedBy })
    createdBy: UserId

    @ValidateBy(vn.date(), { errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidStatusesCount })
    statusesCount: number

    constructor(
        params: {
            id: ChannelEntity["id"]
            name: ChannelEntity["name"]
            uniqueName: ChannelEntity["uniqueName"]
            parentChannelGroupId: ChannelEntity["parentChannelGroupId"]
            createdBy: ChannelEntity["createdBy"]
            createdAt: ChannelEntity["createdAt"]
        } & Partial<ChannelEntity>
    ) {
        super()
        this.id = params.id
        this.name = params.name
        this.uniqueName = params.uniqueName
        this.parentChannelGroupId = params.parentChannelGroupId
        this.createdBy = params.createdBy
        this.createdAt = params.createdAt
        this.statusesCount = params.statusesCount ? params.statusesCount : 0
    }
    toResponseObject() {
        return {
            id: this.id.toString(),
            name: this.name,
            unique_name: this.uniqueName,
            parent_channel_group_id: this.parentChannelGroupId,
            created_by: this.createdBy,
            created_at: this.createdAt,
            statuses_count: this.statusesCount,
        }
    }
    static generateUniqueName(): String {
        return generateRandomName(12)
    }
}
