import * as vn from "../validation"

import { Entity } from "./Entity"
import { TrustLevel } from "../../config/trust_level"
import { UserId } from "../types"
import { ValidateBy } from "../validation/ValidateBy"
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
    InvalidBackgroundImageUrl: "invalid_background_image_url",
    InvalidDisplayName: "invalid_display_name",
    InvalidDescription: "invalid_description",
    InvalidThemeColor: "invalid_theme_color",
    InvalidTwitterId: "invalid_twitter_id",
    InvalidLoginCredential: "invalid_login_credential",
    InvalidLoginSession: "invalid_login_session",
    InvalidNumber: "invalid_number",
    InvalidString: "invalid_string",
    InvalidDate: "invalid_date",
    InvalidValue: "invalid_boolean",
    InvalidUrl: "invalid_url",
    InvalidLocation: "invalid_location",
} as const

export class UserEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidId })
    id: UserId

    // ログイン時に使う一意な英数字
    // idのエイリアス
    // 変更可
    @ValidateBy(vn.user.name(), { errorCode: ErrorCodes.InvalidName })
    name: string

    // Twitterログイン時に保存したTwitterユーザーID
    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidTwitterId })
    twitterUserId: string | null

    @ValidateBy(vn.user.displayName(), { nullable: true, errorCode: ErrorCodes.InvalidDisplayName })
    displayName: string | null

    @ValidateBy(vn.url(), { nullable: true, errorCode: ErrorCodes.InvalidProfileImageUrl })
    profileImageUrl: string | null

    @ValidateBy(vn.user.location(), { nullable: true, errorCode: ErrorCodes.InvalidLocation })
    location: string | null

    @ValidateBy(vn.user.url(), { nullable: true, errorCode: ErrorCodes.InvalidUrl })
    url: string | null

    @ValidateBy(vn.user.description(), { nullable: true, errorCode: ErrorCodes.InvalidDescription })
    description: string | null

    @ValidateBy(vn.colorCode(), { nullable: true, errorCode: ErrorCodes.InvalidThemeColor })
    themeColor: string | null

    @ValidateBy(vn.url(), { nullable: true, errorCode: ErrorCodes.InvalidBackgroundImageUrl })
    backgroundImageUrl: string | null

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidValue })
    defaultProfile: boolean

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    statusesCount: number // 全投稿数

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    favoritesCount: number // ふぁぼった投稿数

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    favoritedCount: number // ふぁぼられた投稿数

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    likesCount: number // いいねした投稿数

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    likedCount: number // いいねされた投稿数

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    channelsCount: number // 作成したチャンネル数

    @ValidateBy(vn.date(), { errorCode: ErrorCodes.InvalidDate })
    createdAt: Date

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidValue })
    bot: boolean

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidValue })
    active: boolean // 登録後サイトを利用したかどうか

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidValue })
    dormant: boolean // サイトを長期間利用しなかったかどうか

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidValue })
    suspended: boolean // 凍結されたかどうか

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    trustLevel: number // 信用レベル

    @ValidateBy(vn.date(), { nullable: true, errorCode: ErrorCodes.InvalidDate })
    lastActivityDate: Date | null // 最後に活動した日

    @ValidateBy(vn.date(), { nullable: true, errorCode: ErrorCodes.InvalidDate })
    termsOfServiceAgreementDate: Date | null // 利用規約に同意した日

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidValue })
    termsOfServiceAgreementVersion: string | null // 同意した利用規約のバージョン

    @ValidateBy(vn.ipAddress(), { errorCode: ErrorCodes.InvalidValue })
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
        this.twitterUserId = params.twitterUserId ? params.twitterUserId : null
        this.displayName = params.displayName ? params.displayName : null
        this.profileImageUrl = params.profileImageUrl ? params.profileImageUrl : null
        this.location = params.location ? params.location : null
        this.url = params.url ? params.url : null
        this.description = params.description ? params.description : null
        this.themeColor = params.themeColor ? params.themeColor : null
        this.backgroundImageUrl = params.backgroundImageUrl ? params.backgroundImageUrl : null
        this.defaultProfile = params.defaultProfile === false ? false : true
        this.createdAt = params.createdAt ? params.createdAt : new Date()
        this.statusesCount = params.statusesCount ? params.statusesCount : 0
        this.favoritesCount = params.favoritesCount ? params.favoritesCount : 0
        this.favoritedCount = params.favoritedCount ? params.favoritedCount : 0
        this.likesCount = params.likesCount ? params.likesCount : 0
        this.likedCount = params.likedCount ? params.likedCount : 0
        this.bot = params.bot ? params.bot : false
        this.active = params.active ? params.active : false
        this.dormant = params.dormant ? params.dormant : false
        this.suspended = params.suspended ? params.suspended : false
        this.trustLevel = params.trustLevel ? params.trustLevel : 0
        this.lastActivityDate = params.lastActivityDate ? params.lastActivityDate : null
        this.termsOfServiceAgreementDate = params.termsOfServiceAgreementDate
            ? params.termsOfServiceAgreementDate
            : null
        this.termsOfServiceAgreementVersion = params.termsOfServiceAgreementVersion
            ? params.termsOfServiceAgreementVersion
            : null
        this.registrationIpAddress = params.registrationIpAddress
    }
    toResponseObject() {
        return {
            id: this.id.toString(),
            name: this.name,
            display_name: this.displayName,
            profile_image_url: this.profileImageUrl,
            location: this.location,
            url: this.url,
            description: this.description,
            theme_color: this.themeColor,
            background_image_url: this.backgroundImageUrl,
            default_profile: this.defaultProfile,
            created_at: this.createdAt,
            status_count: this.statusesCount,
            favorites_count: this.favoritedCount,
            favorited_count: this.favoritedCount,
            likes_count: this.likesCount,
            liked_count: this.likedCount,
            bot: this.bot,
            active: this.active,
            dormant: this.dormant,
            suspended: this.suspended,
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
