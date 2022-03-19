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
    InvalidParentId: "invalid_parent_id",
    InvalidLevel: "invalid_level",
    InvalidCreatedBy: "invalid_created_by",
    InvalidCreatedAt: "invalid_created_at",
    InvalidStatusesCount: "invalid_statuses_count",
} as const

export class ChannelGroupEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidId })
    id: ChannelId

    @ValidateBy(vn.channelGroup.name(), { errorCode: ErrorCodes.InvalidName })
    name: string

    // チャンネルを識別する文字列
    // URLで使われる
    // https://beluga/channel/{uniqueName}
    @ValidateBy(vn.channelGroup.uniqueName(), { errorCode: ErrorCodes.InvalidUniqueName })
    uniqueName: string

    @ValidateBy(vn.number(), { errorCode: ErrorCodes.InvalidLevel })
    level: number

    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidParentId })
    parentId: ChannelGroupdId

    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidCreatedBy })
    createdBy: UserId

    @ValidateBy(vn.date(), { errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidStatusesCount })
    statusesCount: number

    constructor(
        params: {
            id: ChannelGroupEntity["id"]
            name: ChannelGroupEntity["name"]
            uniqueName: ChannelGroupEntity["uniqueName"]
            parentId: ChannelGroupEntity["parentId"]
            createdBy: ChannelGroupEntity["createdBy"]
            createdAt: ChannelGroupEntity["createdAt"]
        } & Partial<ChannelGroupEntity>
    ) {
        super()
        this.id = params.id
        this.name = params.name
        this.uniqueName = params.uniqueName
        this.parentId = params.parentId
        this.createdBy = params.createdBy
        this.createdAt = params.createdAt
        this.statusesCount = params.statusesCount ? params.statusesCount : 0
    }
    toResponseObject() {
        return {
            id: this.id.toString(),
            name: this.name,
            unique_name: this.uniqueName,
            parent_id: this.parentId,
            level: this.level,
            created_by: this.createdBy,
            created_at: this.createdAt,
            statuses_count: this.statusesCount,
        }
    }
    static generateUniqueName(): String {
        return generateRandomName(12)
    }
}
