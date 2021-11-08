import * as vn from "../validation"

import { Entity } from "./Entity"
import { ValidateBy } from "../validation/ValidateBy"
import { v4 } from "uuid"

export const ErrorCodes = {
    InvalidSessionId: "invalid_session_id",
    InvalidToken: "invalid_token",
} as const

export class AuthenticityTokenEntity extends Entity {
    @ValidateBy(vn.sessionId(), { errorCode: ErrorCodes.InvalidSessionId })
    sessionId: string

    @ValidateBy(vn.sessionId(), { errorCode: ErrorCodes.InvalidToken })
    token: string

    constructor(
        params: {
            sessionId: AuthenticityTokenEntity["sessionId"]
        } & Partial<AuthenticityTokenEntity>
    ) {
        super()
        this.sessionId = params.sessionId
        this.token = params.token ? params.token : [v4(), v4()].join("-")
    }
}
