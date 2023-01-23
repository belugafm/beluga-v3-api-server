import { ChannelGroupdId, ChannelId, ChannelJsonObjectT, MessageId, UserId } from "../types"
import {
    IsChannelDescription,
    IsChannelGroupId,
    IsChannelId,
    IsChannelName,
    IsChannelUniqueName,
    IsDate,
    IsInteger,
    IsMessageId,
    IsString,
    IsTrustRank,
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
    InvalidLastMessageId: "invalid_last_message_id",
    InvalidLastMessageCreatedAt: "invalid_last_message_created_at",
    InvalidMinimumTrustRank: "invalid_minimum_trust_rank",
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

    @IsChannelDescription({ nullable: true, errorCode: ErrorCodes.InvalidDescription })
    description: string | null

    @IsMessageId({ nullable: true, errorCode: ErrorCodes.InvalidLastMessageId })
    lastMessageId: MessageId | null

    @IsDate({ nullable: true, errorCode: ErrorCodes.InvalidLastMessageCreatedAt })
    lastMessageCreatedAt: Date | null

    @IsTrustRank({ errorCode: ErrorCodes.InvalidMinimumTrustRank })
    minimumTrustRank: string

    constructor(
        params: {
            id: ChannelEntity["id"]
            name: ChannelEntity["name"]
            uniqueName: ChannelEntity["uniqueName"]
            parentChannelGroupId: ChannelEntity["parentChannelGroupId"]
            createdBy: ChannelEntity["createdBy"]
            createdAt: ChannelEntity["createdAt"]
            minimumTrustRank: ChannelEntity["minimumTrustRank"]
        } & Partial<ChannelEntity>
    ) {
        super()
        this.id = params.id
        this.name = params.name
        this.uniqueName = params.uniqueName
        this.parentChannelGroupId = params.parentChannelGroupId
        this.createdBy = params.createdBy
        this.createdAt = params.createdAt
        this.minimumTrustRank = params.minimumTrustRank
        this.messageCount = params.messageCount != null ? params.messageCount : 0
        this.statusString = params.statusString != null ? params.statusString : "#"
        this.lastMessageId = params.lastMessageId != null ? params.lastMessageId : null
        this.lastMessageCreatedAt = params.lastMessageCreatedAt != null ? params.lastMessageCreatedAt : null
        this.description = params.description != null ? params.description : null
    }
    static getPublicUrlRegexp() {
        const protocol = config.server.https ? "https://" : "http://"
        const baseUrl = protocol.replace("/", "\\/") + config.server.domain + "\\/channel"
        return new RegExp(`${baseUrl}\\/([0-9a-zA-Z_]{1,32})`, "g")
    }
    toJsonObject(): ChannelJsonObjectT {
        return {
            id: this.id,
            name: this.name,
            unique_name: this.uniqueName,
            parent_channel_group_id: this.parentChannelGroupId,
            parent_channel_group: null,
            user_id: this.createdBy,
            user: null,
            created_at: this.createdAt,
            message_count: this.messageCount,
            description: this.description,
            status_string: this.statusString,
            last_message_id: this.lastMessageId,
            last_message_created_at: this.lastMessageCreatedAt,
            minimum_trust_rank: this.minimumTrustRank,
            last_message: null,
            read_state: null,
        }
    }
    static generateUniqueName(): string {
        return generateRandomName(config.channel.unique_name.default_length)
    }
}
