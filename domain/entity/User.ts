import * as vn from "../validation"

import { Entity } from "./Entity"
import { UserId } from "../types"
import { ValidateBy } from "../validation/ValidateBy"

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
    statusCount: number // 全投稿数

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

    @ValidateBy(vn.number({ minValue: 0 }), { errorCode: ErrorCodes.InvalidNumber })
    followingChannelsCount: number // フォロー中のチャンネル数

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
        this.statusCount = params.statusCount ? params.statusCount : 0
        this.favoritesCount = params.favoritesCount ? params.favoritesCount : 0
        this.favoritedCount = params.favoritedCount ? params.favoritedCount : 0
        this.likesCount = params.likesCount ? params.likesCount : 0
        this.likedCount = params.likedCount ? params.likedCount : 0
        this.channelsCount = params.channelsCount ? params.channelsCount : 0
        this.followingChannelsCount = params.followingChannelsCount
            ? params.followingChannelsCount
            : 0
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
}
