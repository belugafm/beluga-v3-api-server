import { IsAnyString, IsBoolean, IsDate, IsIpAddress, IsSessionId, IsUserId } from "../validation/decorators"

import { Entity } from "./Entity"
import { UserId } from "../types"
import config from "../../config/app"
import { v4 } from "uuid"

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
    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsSessionId({ errorCode: ErrorCodes.InvalidSessionId })
    sessionId: string

    @IsIpAddress({ errorCode: ErrorCodes.InvalidIpAddress })
    ipAddress: string

    @IsDate({ errorCode: ErrorCodes.InvalidExpireDate })
    expireDate: Date

    @IsBoolean({ errorCode: ErrorCodes.InvalidExpired })
    expired: boolean

    @IsDate({ errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidCreatedAt })
    lastLocation: string | null

    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidDevice })
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
        this.expireDate =
            params.expireDate != null
                ? params.expireDate
                : new Date(Date.now() + config.user_login_session.lifetime * 1000)
        this.expired = params.expired != null ? params.expired : false
        this.createdAt = params.createdAt != null ? params.createdAt : new Date()
        this.lastLocation = params.lastLocation != null ? params.lastLocation : null
        this.device = params.device == null ? null : params.device
    }
}
