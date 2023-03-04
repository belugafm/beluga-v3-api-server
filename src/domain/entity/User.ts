import {
    IsAnyString,
    IsBoolean,
    IsDate,
    IsInteger,
    IsIpAddress,
    IsUrl,
    IsUserDescription,
    IsUserDisplayName,
    IsUserId,
    IsUserLocation,
    IsUserName,
    IsUserUrl,
} from "../validation/decorators"
import { UserId, UserJsonObjectT } from "../types"

import { Entity } from "./Entity"
import { TrustLevel } from "../../config/trust_level"
import crypto from "crypto"

export const generateRandomName = (length: number): string => {
    const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const N = 16
    return Array.from(crypto.randomFillSync(new Uint8Array(N)))
        .map((n) => S[n % S.length])
        .join("")
}

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidName: "invalid_name",
    InvalidProfileImageUrl: "invalid_profile_image_url",
    InvalidDisplayName: "invalid_display_name",
    InvalidDescription: "invalid_description",
    InvalidTwitterId: "invalid_twitter_id",
    InvalidLoginCredential: "invalid_login_credential",
    InvalidLoginSession: "invalid_login_session",
    InvalidNumber: "invalid_number",
    InvalidString: "invalid_string",
    InvalidDate: "invalid_date",
    InvalidValue: "invalid_boolean",
    InvalidUrl: "invalid_url",
    InvalidBotOwnerId: "invalid_bot_owner_id",
    InvalidLocation: "invalid_location",
} as const

export class UserEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsUserId({ errorCode: ErrorCodes.InvalidId })
    id: UserId

    // ログイン時に使う一意な英数字
    // idのエイリアス
    // 変更可
    @IsUserName({ errorCode: ErrorCodes.InvalidName })
    name: string

    // Twitterログイン時に保存したTwitterユーザーID
    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidTwitterId })
    twitterUserId: string | null

    @IsUserDisplayName({ nullable: true, errorCode: ErrorCodes.InvalidDisplayName })
    displayName: string | null

    @IsUrl({ nullable: true, errorCode: ErrorCodes.InvalidProfileImageUrl })
    profileImageUrl: string | null

    @IsUserLocation({ nullable: true, errorCode: ErrorCodes.InvalidLocation })
    location: string | null

    @IsUserUrl({ nullable: true, errorCode: ErrorCodes.InvalidUrl })
    url: string | null

    @IsUserDescription({ nullable: true, errorCode: ErrorCodes.InvalidDescription })
    description: string | null

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidNumber })
    messageCount: number // 全投稿数

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidNumber })
    favoritesCount: number // ふぁぼった投稿数

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidNumber })
    favoritedCount: number // ふぁぼられた投稿数

    @IsDate({ errorCode: ErrorCodes.InvalidDate })
    createdAt: Date

    @IsBoolean({ errorCode: ErrorCodes.InvalidValue })
    bot: boolean

    @IsUserId({ nullable: true, errorCode: ErrorCodes.InvalidId })
    botOwnerId: UserId | null

    @IsBoolean({ errorCode: ErrorCodes.InvalidValue })
    active: boolean // 登録後サイトを利用したかどうか

    @IsBoolean({ errorCode: ErrorCodes.InvalidValue })
    dormant: boolean // サイトを長期間利用しなかったかどうか

    @IsBoolean({ errorCode: ErrorCodes.InvalidValue })
    suspended: boolean // 凍結されたかどうか

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidNumber })
    trustLevel: number // 信用レベル

    @IsDate({ nullable: true, errorCode: ErrorCodes.InvalidDate })
    lastActivityDate: Date | null // 最後に活動した日

    @IsDate({ nullable: true, errorCode: ErrorCodes.InvalidDate })
    termsOfServiceAgreementDate: Date | null // 利用規約に同意した日

    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidValue })
    termsOfServiceAgreementVersion: string | null // 同意した利用規約のバージョン

    @IsIpAddress({ errorCode: ErrorCodes.InvalidValue })
    registrationIpAddress: string // 登録時のIPアドレス

    constructor(
        params: {
            id: UserEntity["id"]
            name: UserEntity["name"]
            registrationIpAddress: UserEntity["registrationIpAddress"]
        } & Partial<UserEntity>
    ) {
        super()
        this.id = params.id
        this.name = params.name
        this.twitterUserId = params.twitterUserId != null ? params.twitterUserId : null
        this.displayName = params.displayName != null ? params.displayName : null
        this.profileImageUrl = params.profileImageUrl != null ? params.profileImageUrl : null
        this.location = params.location != null ? params.location : null
        this.url = params.url != null ? params.url : null
        this.description = params.description != null ? params.description : null
        this.createdAt = params.createdAt != null ? params.createdAt : new Date()
        this.messageCount = params.messageCount != null ? params.messageCount : 0
        this.favoritesCount = params.favoritesCount != null ? params.favoritesCount : 0
        this.favoritedCount = params.favoritedCount != null ? params.favoritedCount : 0
        this.bot = params.bot != null ? params.bot : false
        this.botOwnerId = params.botOwnerId != null ? params.botOwnerId : null
        this.active = params.active != null ? params.active : false
        this.dormant = params.dormant != null ? params.dormant : false
        this.suspended = params.suspended != null ? params.suspended : false
        this.trustLevel = params.trustLevel != null ? params.trustLevel : 0
        this.lastActivityDate = params.lastActivityDate != null ? params.lastActivityDate : null
        this.termsOfServiceAgreementDate =
            params.termsOfServiceAgreementDate != null ? params.termsOfServiceAgreementDate : null
        this.termsOfServiceAgreementVersion =
            params.termsOfServiceAgreementVersion != null ? params.termsOfServiceAgreementVersion : null
        this.registrationIpAddress = params.registrationIpAddress
    }
    toJsonObject(): UserJsonObjectT {
        return {
            id: this.id,
            name: this.name,
            display_name: this.displayName,
            profile_image_url: this.profileImageUrl,
            location: this.location,
            url: this.url,
            description: this.description,
            created_at: this.createdAt,
            message_count: this.messageCount,
            favorites_count: this.favoritedCount,
            favorited_count: this.favoritedCount,
            bot: this.bot,
            bot_owner_id: this.botOwnerId,
            active: this.active,
            dormant: this.dormant,
            suspended: this.suspended,
            muted: false,
            blocked: false,
            trust_level: this.trustLevel,
            last_activity_date: this.lastActivityDate,
        }
    }
    static getInitialTrustLevel(condition: {
        signedUpWithTwitter: boolean
        invitedByAuthorizedUser: boolean
        twitterAccountCreatedAt: Date | null
    }) {
        if (condition.invitedByAuthorizedUser) {
            // Authorized Userから招待されていたら同じ信頼度にする
            return TrustLevel.AuthorizedUser
        }
        if (condition.signedUpWithTwitter == false) {
            // Twitterログインしていないユーザーは信頼しない
            return TrustLevel.RiskyUser
        }
        if (condition.twitterAccountCreatedAt == null) {
            // ここを通ったらバグっている
            return TrustLevel.RiskyUser
        }
        // とりあえず作成から１年経ってたら信頼する
        const period = 1 * 365 * 24 * 60 * 60 * 1000
        if (condition.twitterAccountCreatedAt.getTime() + period <= new Date().getTime()) {
            return TrustLevel.AuthorizedUser
        }
        // Moderator以上は手動で設定するのでここではしない
        return TrustLevel.Visitor
    }
}
