import { ApplicationError } from "../ApplicationError"
import { AuthenticityTokenEntity } from "../../domain/entity/AuthenticityToken"
import { IAuthenticityTokenQueryRepository } from "../../domain/repository/query/AuthenticityToken"
import { ILoginSessionQueryRepository } from "../../domain/repository/query/LoginSession"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { LoginSessionEntity } from "../../domain/entity/LoginSession"
import { UserEntity } from "../../domain/entity/User"

type Argument = {
    sessionId: string
}

export const ErrorCodes = {
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
    SessionNotFound: "session_not_found",
    AuthTokenNotFound: "auth_token_not_found",
} as const

export class CookieAuthenticationApplication {
    private userQueryRepository: IUserQueryRepository
    private loginSessionQueryRepository: ILoginSessionQueryRepository
    private authenticityTokenQueryRepository: IAuthenticityTokenQueryRepository
    constructor(
        userQueryRepository: IUserQueryRepository,
        loginSessionQueryRepository: ILoginSessionQueryRepository,
        authenticityTokenQueryRepository: IAuthenticityTokenQueryRepository
    ) {
        this.userQueryRepository = userQueryRepository
        this.loginSessionQueryRepository = loginSessionQueryRepository
        this.authenticityTokenQueryRepository = authenticityTokenQueryRepository
    }
    async authenticate({
        sessionId,
    }: Argument): Promise<[UserEntity, LoginSessionEntity, AuthenticityTokenEntity]> {
        try {
            const session = await this.loginSessionQueryRepository.findBySessionId(sessionId)
            if (session == null) {
                throw new ApplicationError(ErrorCodes.SessionNotFound)
            }
            const user = await this.userQueryRepository.findById(session.userId)
            if (user == null) {
                throw new ApplicationError(ErrorCodes.UserNotFound)
            }
            const auth = await this.authenticityTokenQueryRepository.findBySessionId(sessionId)
            if (auth == null) {
                throw new ApplicationError(ErrorCodes.AuthTokenNotFound)
            }
            return [user, session, auth]
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
