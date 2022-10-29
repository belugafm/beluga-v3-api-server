import { Entity } from "./Entity"
import { IsApplicationId, IsDate, IsToken, IsUserId } from "../validation/decorators"
import { v4 } from "uuid"
import { ApplicationId, UserId } from "../types"

export const ErrorCodes = {
    InvalidSecret: "invalid_secret",
    InvalidToken: "invalid_token",
    InvalidVerifier: "invalid_verifier",
    InvalidVerifiedUserId: "invalid_verified_user_id",
    InvalidUserId: "invalid_user_id",
    InvalidApplicationId: "invalid_application_id",
    InvalidExpireDate: "invalid_expire_date",
} as const

export class RequestTokenEntity extends Entity {
    @IsToken({ errorCode: ErrorCodes.InvalidToken })
    token: string

    @IsToken({ errorCode: ErrorCodes.InvalidSecret })
    secret: string

    @IsToken({ nullable: true, errorCode: ErrorCodes.InvalidVerifier })
    verifier: string | null

    @IsUserId({ nullable: true, errorCode: ErrorCodes.InvalidVerifiedUserId })
    verifiedUserId: UserId | null

    @IsApplicationId({ errorCode: ErrorCodes.InvalidUserId })
    applicationId: ApplicationId

    @IsDate({ errorCode: ErrorCodes.InvalidExpireDate })
    expireDate: Date

    constructor(params: { applicationId: ApplicationId } & Partial<RequestTokenEntity>) {
        super()
        this.applicationId = params.applicationId
        this.token = params.token != null ? params.token : v4()
        this.secret = params.secret != null ? params.secret : v4()
        this.verifier = params.verifier ? params.verifier : null
        this.verifiedUserId = params.verifiedUserId != null ? params.verifiedUserId : null
        this.expireDate = params.expireDate != null ? params.expireDate : new Date(Date.now() + 600 * 1000)
    }
}
