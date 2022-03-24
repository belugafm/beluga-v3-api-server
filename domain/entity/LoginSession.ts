import * as vn from "../validation"

import { Entity } from "./Entity"
import { UserId } from "../types"
import config from "../../config/app"
import { v4 } from "uuid"
import { validateBy } from "../validation/validateBy"

export const ErrorCodes = {
    InvalidUserId: "invalid_user_id",
    InvalidSessionId: "invalid_session_id",
    InvalidIpAddress: "invalid_ip_address",
    InvalidExpireDate: "invalid_expire_date",
    InvalidExpired: "invalid_expired",
    InvalidCreatedAt: "invalid_created_at",
    InvalidLastLocation: "invalid_last_location",
    InvalidDevice: "invalid_device",
} as const

export class LoginSessionEntity extends Entity {
    @validateBy(vn.objectId(), { errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @validateBy(vn.sessionId(), { errorCode: ErrorCodes.InvalidSessionId })
    sessionId: string

    @validateBy(vn.ipAddress(), { errorCode: ErrorCodes.InvalidIpAddress })
    ipAddress: string

    @validateBy(vn.date(), { errorCode: ErrorCodes.InvalidExpireDate })
    expireDate: Date

    @validateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidExpired })
    expired: boolean

    @validateBy(vn.date(), { errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @validateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidCreatedAt })
    lastLocation: string | null

    @validateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidDevice })
    device: string | null

    constructor(
        params: {
            userId: LoginSessionEntity["userId"]
            ipAddress: LoginSessionEntity["ipAddress"]
        } & Partial<LoginSessionEntity>
    ) {
        super()
        this.userId = params.userId
        this.sessionId = params.sessionId ? params.sessionId : [v4(), v4()].join("-")
        this.ipAddress = params.ipAddress
        this.expireDate = params.expireDate
            ? params.expireDate
            : new Date(Date.now() + config.user_login_session.lifetime * 1000)
        this.expired = params.expired ? params.expired : false
        this.createdAt = params.createdAt ? params.createdAt : new Date()
        this.lastLocation = params.lastLocation ? params.lastLocation : null
        this.device = params.device ? params.device : null
    }
}
