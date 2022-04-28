import * as vn from "../validation"

import { Entity } from "./Entity"
import { v4 } from "uuid"
import { validateBy } from "../validation/validateBy"

export const ErrorCodes = {
    InvalidSessionId: "invalid_session_id",
    InvalidToken: "invalid_token",
} as const

export class AuthenticityTokenEntity extends Entity {
    @validateBy(vn.sessionId(), { errorCode: ErrorCodes.InvalidSessionId })
    sessionId: string

    @validateBy(vn.sessionId(), { errorCode: ErrorCodes.InvalidToken })
    token: string

    constructor(
        params: {
            sessionId: AuthenticityTokenEntity["sessionId"]
        } & Partial<AuthenticityTokenEntity>
    ) {
        super()
        this.sessionId = params.sessionId
        this.token = params.token != null ? params.token : [v4(), v4()].join("-")
    }
}
