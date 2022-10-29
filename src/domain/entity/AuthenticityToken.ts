import { Entity } from "./Entity"
import { IsToken } from "../validation/decorators"
import { v4 } from "uuid"

export const ErrorCodes = {
    InvalidSessionId: "invalid_session_id",
    InvalidToken: "invalid_token",
} as const

export class AuthenticityTokenEntity extends Entity {
    @IsToken({ errorCode: ErrorCodes.InvalidSessionId })
    sessionId: string

    @IsToken({ errorCode: ErrorCodes.InvalidToken })
    token: string

    constructor(
        params: {
            sessionId: AuthenticityTokenEntity["sessionId"]
        } & Partial<AuthenticityTokenEntity>
    ) {
        super()
        this.sessionId = params.sessionId
        this.token = params.token != null ? params.token : v4()
    }
}
