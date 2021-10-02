import * as vn from "../validation"

import { DomainError } from "../DomainError"
import { UserId } from "../types"
import { ValidateBy } from "../validation/ValidateBy"
import bcrypt from "bcrypt"
import config from "../../config/app"

export const ErrorCodes = {
    InvalidUserId: "invalid_user_id",
    InvaldPasswordHash: "invalid_password_hash",
    InvaidPasswordInput: "invalid_password_input",
    PasswordNotMeetPolicy: "password_not_meet_policy",
} as const

export class LoginCredentialEntity {
    // @ts-ignore

    @ValidateBy(vn.objectId(), ErrorCodes.InvalidUserId)
    userId: UserId
    // @ts-ignore
    @ValidateBy(vn.string(), ErrorCodes.InvaidPasswordInput)
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
        this.userId = params.userId
        this.passwordHash = params.passwordHash
    }
}
