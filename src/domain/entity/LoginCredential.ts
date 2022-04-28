import * as vn from "../validation"

import { DomainError } from "../DomainError"
import { Entity } from "./Entity"
import { UserId } from "../types"
import bcrypt from "bcrypt"
import config from "../../config/app"
import { validateBy } from "../validation/validateBy"

export const ErrorCodes = {
    InvalidUserId: "invalid_user_id",
    InvaldPasswordHash: "invalid_password_hash",
    InvaidPasswordInput: "invalid_password_input",
    PasswordNotMeetPolicy: "password_not_meet_policy",
} as const

export class LoginCredentialEntity extends Entity {
    // @ts-ignore

    @validateBy(vn.userId(), ErrorCodes.InvalidUserId)
    userId: UserId
    // @ts-ignore
    @validateBy(vn.string(), ErrorCodes.InvaidPasswordInput)
    passwordHash: string

    static async new(userId: UserId, password: string) {
        if (vn.isString(password) !== true) {
            throw new DomainError(ErrorCodes.InvaidPasswordInput)
        }
        if (vn.password().ok(password) !== true) {
            throw new DomainError(ErrorCodes.PasswordNotMeetPolicy)
        }
        const passwordHash = await bcrypt.hash(
            password,
            config.user_login_credential.password.salt_rounds
        )
        return new LoginCredentialEntity({ userId, passwordHash })
    }
    constructor(params: { userId: UserId; passwordHash: string }) {
        super()
        this.userId = params.userId
        this.passwordHash = params.passwordHash
    }
}
