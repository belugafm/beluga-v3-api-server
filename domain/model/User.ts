import { DomainError } from "../error"
import * as vn from "../validation"
import { LoginCredentialModel } from "./LoginCredential"
import { LoginSessionModel } from "./LoginSession"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidName: "invalid_name",
    InvalidDisplayName: "invalid_display_name",
    InvalidLoginCredential: "invalid_login_credential",
    InvalidLoginSession: "invalid_login_session",
} as const

export class UserModel {
    // @ts-ignore
    private _id: UserID // 一意なid DBの実装に依存する 変更不可
    // @ts-ignore
    private _name: string // ログイン時に使う一意な英数字 idのエイリアス 変更可
    private _twitterUserId: string | null // Twitterログイン時に保存したTwitterユーザーID

    private _loginCredential: LoginCredentialModel | null
    private _loginSession: LoginSessionModel | null

    private _displayName: string | null
    private _profileImageUrl: string | null
    private _location: string | null
    private _url: string | null
    private _description: string | null
    private _themeColor: string | null
    private _backgroundImageUrl: string | null
    private _defaultProfile: boolean

    private _statusCount: number // 全投稿数
    private _favoritesCount: number // ふぁぼった投稿数
    private _favoritedCount: number // ふぁぼられた投稿数
    private _likesCount: number // いいねした投稿数
    private _likedCount: number // いいねされた投稿数
    private _channelsCount: number // 作成したチャンネル数
    private _followingChannelsCount: number // フォロー中のチャンネル数

    private _createdAt: Date
    private _active: boolean // 登録後サイトを利用したかどうか
    private _dormant: boolean // サイトを長期間利用しなかったかどうか
    private _suspended: boolean // 凍結されたかどうか
    private _trustLevel: number // 信用レベル
    private _lastActivityDate: Date | null // 最後に活動した日
    private _termsOfServiceAgreementDate: Date | null // 利用規約に同意した日
    private _termsOfServiceAgreementVersion: string | null // 同意した利用規約のバージョン

    constructor(id: UserID, name: string) {
        this.id = id
        this.name = name
        this._twitterUserId = null
        this._loginCredential = null
        this._loginSession = null
        this._displayName = null
        this._profileImageUrl = null
        this._location = null
        this._url = null
        this._description = null
        this._themeColor = null
        this._backgroundImageUrl = null
        this._defaultProfile = true
        this._createdAt = new Date()
        this._statusCount = 0
        this._favoritesCount = 0
        this._favoritedCount = 0
        this._likesCount = 0
        this._likedCount = 0
        this._channelsCount = 0
        this._followingChannelsCount = 0
        this._active = false
        this._dormant = false
        this._suspended = false
        this._trustLevel = 0
        this._lastActivityDate = null
        this._termsOfServiceAgreementDate = null
        this._termsOfServiceAgreementVersion = null
    }
    get id() {
        return this._id
    }
    get name() {
        return this._name
    }
    get twitterUserId() {
        return this._twitterUserId
    }
    get loginCredential() {
        return this._loginCredential
    }
    get displayName() {
        return this._displayName
    }
    get profileImageUrl() {
        return this._profileImageUrl
    }
    get location() {
        return this._location
    }
    get url() {
        return this._url
    }
    get description() {
        return this._description
    }
    get themeColor() {
        return this._themeColor
    }
    get backgroundImageUrl() {
        return this._backgroundImageUrl
    }
    get defaultProfile() {
        return this._defaultProfile
    }
    get statusCount() {
        return this._statusCount
    }
    get favoritesCount() {
        return this._favoritesCount
    }
    get favoritedCount() {
        return this._favoritedCount
    }
    get likesCount() {
        return this._likesCount
    }
    get likedCount() {
        return this._likedCount
    }
    get channelsCount() {
        return this._channelsCount
    }
    get followingChannelsCount() {
        return this._followingChannelsCount
    }
    get createdAt() {
        return this._createdAt
    }
    get active() {
        return this._active
    }
    get dormant() {
        return this._dormant
    }
    get suspended() {
        return this._suspended
    }
    get trustLevel() {
        return this._trustLevel
    }
    get lastActivityDate() {
        return this._lastActivityDate
    }
    get termsOfServiceAgreementDate() {
        return this._termsOfServiceAgreementDate
    }
    get termsOfServiceAgreementVersion() {
        return this._termsOfServiceAgreementVersion
    }
    set id(id: string | number) {
        if (vn.is_number(id)) {
            this._id = id
            return
        }
        if (vn.is_string(id)) {
            this._id = id
            return
        }
        throw new DomainError(ErrorCodes.InvalidId)
    }
    set name(name: string) {
        if (vn.user.name().ok(name) !== true) {
            throw new DomainError(ErrorCodes.InvalidName)
        }
        this._name = name
    }
    set displayName(displayName: string | null) {
        if (displayName === null) {
            this._displayName = null
            return
        }
        if (vn.user.displayName().ok(displayName) !== true) {
            throw new DomainError(ErrorCodes.InvalidDisplayName)
        }
        this._displayName = displayName
    }
    set loginCredential(loginCredential: LoginCredentialModel | null) {
        if (loginCredential === null) {
            this._loginCredential = null
            return
        }
        if (loginCredential instanceof LoginCredentialModel) {
            this._loginCredential = loginCredential
            return
        }
        throw new DomainError(ErrorCodes.InvalidLoginCredential)
    }
    set LoginSession(LoginSession: LoginSessionModel | null) {
        if (LoginSession === null) {
            this._loginSession = null
            return
        }
        if (LoginSession instanceof LoginSessionModel) {
            this._loginSession = LoginSession
            return
        }
        throw new DomainError(ErrorCodes.InvalidLoginSession)
    }
}
