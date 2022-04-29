import { ChannelGroupdId, ChannelId, UserId } from "../types"
import {
    IsChannelDescription,
    IsChannelGroupId,
    IsChannelId,
    IsChannelName,
    IsChannelUniqueName,
    IsDate,
    IsInteger,
    IsString,
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
    InvalidParentChanelGroupId: "invalid_parent_channel_group_id",
    InvalidCreatedBy: "invalid_created_by",
    InvalidCreatedAt: "invalid_created_at",
    InvalidMessageCount: "invalid_message_count",
    InvalidStatusString: "invalid_status_string",
    InvalidDescription: "invalid_description",
} as const

export class ChannelEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsChannelId({ errorCode: ErrorCodes.InvalidId })
    id: ChannelId

    @IsChannelName({ errorCode: ErrorCodes.InvalidName })
    name: string

    // チャンネルを識別する文字列
    // URLで使われる
    // https://beluga/channel/{uniqueName}
    @IsChannelUniqueName({ errorCode: ErrorCodes.InvalidUniqueName })
    uniqueName: string

    @IsChannelGroupId({ errorCode: ErrorCodes.InvalidParentChanelGroupId })
    parentChannelGroupId: ChannelGroupdId

    @IsUserId({ errorCode: ErrorCodes.InvalidCreatedBy })
    createdBy: UserId

    @IsDate({ errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidMessageCount })
    messageCount: number

    @IsString({ minLength: 1, maxLength: 1 }, { errorCode: ErrorCodes.InvalidStatusString })
    statusString: string

    @IsChannelDescription({ errorCode: ErrorCodes.InvalidDescription })
    description: string

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
        this.messageCount = params.messageCount != null ? params.messageCount : 0
        this.statusString = params.statusString != null ? params.statusString : "#"
        this.description = params.description != null ? params.description : ""
    }
    toResponseObject() {
        return {
            id: this.id,
            name: this.name,
            unique_name: this.uniqueName,
            parent_channel_group_id: this.parentChannelGroupId,
            created_by: this.createdBy,
            created_at: this.createdAt,
            message_count: this.messageCount,
            description: this.description,
            status_string: this.statusString,
        }
    }
    static generateUniqueName(): string {
        return generateRandomName(config.channel.unique_name.default_length)
    }
}
