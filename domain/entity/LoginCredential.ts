import { DomainError } from "../DomainError"
import * as vn from "../validation"
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
    private _userId: UserId
    // @ts-ignore
    private _passwordHash: string

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
        return new LoginCredentialEntity(userId, passwordHash)
    }
    constructor(userId: UserId, passwordHash: string) {
        this.userId = userId
        this.passwordHash = passwordHash
    }
    get userId() {
        return this._userId
    }
    get passwordHash() {
        return this._passwordHash
    }
    set userId(userId: UserId) {
        if (vn.objectId().ok(userId)) {
            this._userId = userId
            return
        }
        throw new DomainError(ErrorCodes.InvalidUserId)
    }
    set passwordHash(passwordHash: string) {
        if (vn.string().ok(passwordHash) !== true) {
            throw new DomainError(ErrorCodes.InvaldPasswordHash)
        }
        this._passwordHash = passwordHash
    }
}
