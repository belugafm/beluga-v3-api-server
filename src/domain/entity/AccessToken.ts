import { Entity } from "./Entity"
import { IsApplicationId, IsToken, IsUserId } from "../validation/decorators"
import { v4 } from "uuid"
import { ApplicationId, UserId } from "../types"

export const ErrorCodes = {
    InvalidSecret: "invalid_secret",
    InvalidToken: "invalid_token",
    InvalidUserId: "invalid_user_id",
    InvalidApplicationId: "invalid_application_id",
    InvalidReadPermission: "invalid_read_permission",
    InvalidWritePermission: "invalid_write_permission",
} as const

export class AccessTokenEntity extends Entity {
    @IsToken({ errorCode: ErrorCodes.InvalidToken })
    token: string

    @IsToken({ errorCode: ErrorCodes.InvalidSecret })
    secret: string

    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsApplicationId({ errorCode: ErrorCodes.InvalidUserId })
    applicationId: ApplicationId

    constructor(
        params: {
            userId: AccessTokenEntity["userId"]
            applicationId: AccessTokenEntity["applicationId"]
        } & Partial<AccessTokenEntity>
    ) {
        super()
        this.userId = params.userId
        this.applicationId = params.applicationId
        this.token = params.token != null ? params.token : v4()
        this.secret = params.secret != null ? params.secret : v4()
    }
}
