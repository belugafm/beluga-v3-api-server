import * as vn from "../validation"

import { Entity } from "./Entity"
import { ValidateBy } from "../validation/ValidateBy"

export const ErrorCodes = {
    InvalidSessionId: "invalid_session_id",
    InvalidToken: "invalid_token",
} as const

export class AuthenticityTokenEntity extends Entity {
    @ValidateBy(vn.sessionId(), { errorCode: ErrorCodes.InvalidSessionId })
    sessionId: UserId

    @ValidateBy(vn.sessionId(), { errorCode: ErrorCodes.InvalidToken })
    token: string

    constructor(params: AuthenticityTokenEntity) {
        super()
        this.sessionId = params.sessionId
        this.token = params.token
    }
}
