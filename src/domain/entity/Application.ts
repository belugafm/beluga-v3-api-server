import { ApplicationId, ApplicationJsonObjectT, UserId } from "../types"
import {
    IsApplicationDescription,
    IsDate,
    IsUserId,
    IsString,
    IsApplicationName,
    IsApplicationId,
    IsToken,
    IsBoolean,
} from "../validation/decorators"
import { v4 } from "uuid"

import { Entity } from "./Entity"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidUserId: "invalid_user_id",
    InvalidCreatedAt: "invalid_created_at",
    InvalidName: "invalid_name",
    InvalidDescription: "invalid_description",
    InvalidCallbackUrl: "invalid_callback_url",
    InvalidSecret: "invalid_secret",
    InvalidToken: "invalid_token",
    InvalidReadPermission: "invalid_read_permission",
    InvalidWritePermission: "invalid_write_permission",
} as const

export class ApplicationEntity extends Entity {
    @IsApplicationId({ errorCode: ErrorCodes.InvalidId })
    id: ApplicationId

    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsDate({ errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @IsApplicationName({ errorCode: ErrorCodes.InvalidName })
    name: string

    @IsApplicationDescription({ nullable: true, errorCode: ErrorCodes.InvalidDescription })
    description: string | null

    @IsString({ minLength: 1, maxLength: 300 }, { errorCode: ErrorCodes.InvalidCallbackUrl })
    callbackUrl: string

    @IsToken({ errorCode: ErrorCodes.InvalidToken })
    token: string

    @IsToken({ errorCode: ErrorCodes.InvalidSecret })
    secret: string

    @IsBoolean({ errorCode: ErrorCodes.InvalidReadPermission })
    read: boolean

    @IsBoolean({ errorCode: ErrorCodes.InvalidWritePermission })
    write: boolean

    constructor(
        params: {
            id: ApplicationEntity["id"]
            userId: ApplicationEntity["userId"]
            createdAt: ApplicationEntity["createdAt"]
            name: ApplicationEntity["name"]
            description: ApplicationEntity["description"]
            callbackUrl: ApplicationEntity["callbackUrl"]
            read: ApplicationEntity["read"]
            write: ApplicationEntity["write"]
        } & Partial<ApplicationEntity>
    ) {
        super()
        this.id = params.id
        this.userId = params.userId
        this.createdAt = params.createdAt
        this.name = params.name
        this.description = params.description
        this.callbackUrl = params.callbackUrl
        this.token = params.token != null ? params.token : v4()
        this.secret = params.secret != null ? params.secret : v4()
        this.read = params.read
        this.write = params.write
    }
    toJsonObject(): ApplicationJsonObjectT {
        return {
            id: this.id,
            user_id: this.userId,
            created_at: this.createdAt,
            name: this.name,
            description: this.description,
            callback_url: this.callbackUrl,
            token: this.token,
            secret: this.secret,
            read: this.read,
            write: this.write,
        }
    }
}
