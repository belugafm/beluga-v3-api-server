import { DomainError } from "../error"
import * as vn from "../validation"
import { ValidateBy } from "../validation/decorators"
import { LoginCredentialEntity } from "./LoginCredential"
import { LoginSessionEntity } from "./LoginSession"

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

export class UserEntity {
    private _loginCredential: LoginCredentialEntity | null
    private _loginSession: LoginSessionEntity | null

    // 一意なid DBの実装に依存する
    // 変更不可
    @ValidateBy(vn.entityId(), { errorCode: ErrorCodes.InvalidDate })
    id: UserID

    // ログイン時に使う一意な英数字
    // idのエイリアス
    // 変更可
    @ValidateBy(vn.user.name(), { errorCode: ErrorCodes.InvalidName })
    name: string

    // Twitterログイン時に保存したTwitterユーザーID
    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidTwitterId })
    twitterUserId: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidDisplayName })
    displayName: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidProfileImageUrl })
    profileImageUrl: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidLocation })
    location: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidUrl })
    url: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidDescription })
    description: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidThemeColor })
    themeColor: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidBackgroundImageUrl })
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
    active: boolean // 登録後サイトを利用したかどうか

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidValue })
    dormant: boolean // サイトを長期間利用しなかったかどうか

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidValue })
    suspended: boolean // 凍結されたかどうか

    @ValidateBy(vn.number(), { errorCode: ErrorCodes.InvalidNumber })
    trustLevel: number // 信用レベル

    @ValidateBy(vn.date(), { nullable: true, errorCode: ErrorCodes.InvalidDate })
    lastActivityDate: Date | null // 最後に活動した日

    @ValidateBy(vn.date(), { nullable: true, errorCode: ErrorCodes.InvalidDate })
    termsOfServiceAgreementDate: Date | null // 利用規約に同意した日

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidValue })
    termsOfServiceAgreementVersion: string | null // 同意した利用規約のバージョン

    constructor(id: UserID, name: string) {
        this.id = id
        this.name = name
        this.twitterUserId = null
        this.loginCredential = null
        this.loginSession = null
        this.displayName = null
        this.profileImageUrl = null
        this.location = null
        this.url = null
        this.description = null
        this.themeColor = null
        this.backgroundImageUrl = null
        this.defaultProfile = true
        this.createdAt = new Date()
        this.statusCount = 0
        this.favoritesCount = 0
        this.favoritedCount = 0
        this.likesCount = 0
        this.likedCount = 0
        this.channelsCount = 0
        this.followingChannelsCount = 0
        this.active = false
        this.dormant = false
        this.suspended = false
        this.trustLevel = 0
        this.lastActivityDate = null
        this.termsOfServiceAgreementDate = null
        this.termsOfServiceAgreementVersion = null
    }
    get loginCredential() {
        return this._loginCredential
    }
    get loginSession() {
        return this._loginSession
    }
    set loginCredential(loginCredential: LoginCredentialEntity | null) {
        if (loginCredential == null) {
            this._loginCredential = null
            return
        }
        if (loginCredential instanceof LoginCredentialEntity) {
            this._loginCredential = loginCredential
            return
        }
        throw new DomainError(ErrorCodes.InvalidLoginCredential)
    }
    set loginSession(LoginSession: LoginSessionEntity | null) {
        if (LoginSession == null) {
            this._loginSession = null
            return
        }
        if (LoginSession instanceof LoginSessionEntity) {
            this._loginSession = LoginSession
            return
        }
        throw new DomainError(ErrorCodes.InvalidLoginSession)
    }
}
