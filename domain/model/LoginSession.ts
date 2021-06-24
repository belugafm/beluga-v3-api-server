import { DomainError } from "../error"
import * as vn from "../validation"
import uuid from "uuid"
import config from "../../config/app.default"

export const ErrorCodes = {
    InvalidUserId: "invalid_user_id",
    InvaldSessionId: "invalid_session_id",
    InvaldIpAddress: "invalid_ip_address",
    InvaldExpireDate: "invalid_expire_date",
    InvaldExpired: "invalid_expired",
    InvaldCreatedAt: "invalid_created_at",
} as const

export class LoginSessionModel {
    // @ts-ignore
    private _userId: UserID
    // @ts-ignore
    private _sessionId: string
    // @ts-ignore
    private _ipAddress: string
    // @ts-ignore
    private _expireDate: Date
    // @ts-ignore
    private _expired: boolean
    // @ts-ignore
    private _createdAt: Date

    static new(userId: UserID, ipAddress: string) {
        const sessionId = uuid.v4()
        const expireDate = new Date(Date.now() + config.user_login_session.lifetime * 1000)
        const expired = false
        const createdAt = new Date()
        return new LoginSessionModel({
            userId,
            ipAddress,
            sessionId,
            expireDate,
            expired,
            createdAt,
        })
    }
    constructor(params: {
        userId: UserID
        sessionId: string
        ipAddress: string
        expireDate: Date
        expired: boolean
        createdAt: Date
    }) {
        this.userId = params.userId
        this.sessionId = params.sessionId
        this.ipAddress = params.ipAddress
        this.expireDate = params.expireDate
        this.expired = params.expired
        this.createdAt = params.createdAt
    }
    get userId() {
        return this._userId
    }
    get sessionId() {
        return this._sessionId
    }
    get ipAddress() {
        return this._ipAddress
    }
    get expireDate() {
        return this._expireDate
    }
    get expired() {
        return this._expired
    }
    get createdAt() {
        return this._createdAt
    }

    set userId(userId: UserID) {
        if (vn.objectId().ok(userId)) {
            this._userId = userId
            return
        }
        this._userId = userId
    }
    set sessionId(sessionId: string) {
        if (vn.string({ max_length: 128 }).ok(sessionId) !== true) {
            throw new DomainError(ErrorCodes.InvaldSessionId)
        }
        this._sessionId = sessionId
    }
    set ipAddress(ipAddress: string) {
        if (vn.ip_address().ok(ipAddress) !== true) {
            throw new DomainError(ErrorCodes.InvaldIpAddress)
        }
        this._ipAddress = ipAddress
    }
    set expireDate(expireDate: Date) {
        if (vn.date().ok(expireDate) !== true) {
            throw new DomainError(ErrorCodes.InvaldExpireDate)
        }
        this._expireDate = expireDate
    }
    set expired(expired: boolean) {
        if (vn.boolean().ok(expired) !== true) {
            throw new DomainError(ErrorCodes.InvaldExpired)
        }
        this._expired = expired
    }
    set createdAt(createdAt: Date) {
        if (vn.date().ok(createdAt) !== true) {
            throw new DomainError(ErrorCodes.InvaldCreatedAt)
        }
        this._createdAt = createdAt
    }
}
