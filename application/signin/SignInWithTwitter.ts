import { ApplicationError } from "../ApplicationError"
import { AuthenticityTokenEntity } from "../../domain/entity/AuthenticityToken"
import { IAuthenticityTokenCommandRepository } from "../../domain/repository/command/AuthenticityToken"
import { ILoginSessionsCommandRepository } from "../../domain/repository/command/LoginSessions"
import { IUsersQueryRepository } from "../../domain/repository/query/Users"
import { LoginSessionEntity } from "../../domain/entity/LoginSession"
import { UserEntity } from "../../domain/entity/User"
import { UserId } from "../../domain/types"

type Argument = {
    twitterUserId: string
    ipAddress: string
    lastLocation: string | null
    device: string | null
}

export const ErrorCodes = {
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
    IncorrectPassword: "incorrect_password",
} as const

export class SignInWithTwitterApplication {
    private usersQueryRepository: IUsersQueryRepository
    private loginSessionCommandRepository: ILoginSessionsCommandRepository
    private authenticityTokenCommandRepository: IAuthenticityTokenCommandRepository
    constructor(
        usersQueryRepository: IUsersQueryRepository,
        loginSessionCommandRepository: ILoginSessionsCommandRepository,
        authenticityTokenCommandRepository: IAuthenticityTokenCommandRepository
    ) {
        this.usersQueryRepository = usersQueryRepository
        this.loginSessionCommandRepository = loginSessionCommandRepository
        this.authenticityTokenCommandRepository = authenticityTokenCommandRepository
    }
    async createLoginSession(
        userId: UserId,
        ipAddress: Argument["ipAddress"],
        lastLocation: Argument["lastLocation"],
        device: Argument["device"]
    ) {
        const session = new LoginSessionEntity({
            userId: userId,
            ipAddress: ipAddress,
            lastLocation: lastLocation ? lastLocation : null,
            device: device ? device : null,
        })
        await this.loginSessionCommandRepository.add(session)
        return session
    }
    async createAuthenticityToken(sessionId: string) {
        const token = new AuthenticityTokenEntity({ sessionId })
        await this.authenticityTokenCommandRepository.add(token)
        return token
    }
    async signin({
        twitterUserId,
        ipAddress,
        lastLocation,
        device,
    }: Argument): Promise<[UserEntity, LoginSessionEntity, AuthenticityTokenEntity]> {
        try {
            const user = await this.usersQueryRepository.findByTwitterUserId(twitterUserId)
            if (user == null) {
                throw new ApplicationError(ErrorCodes.UserNotFound)
            }
            const loginSession = await this.createLoginSession(
                user.id,
                ipAddress,
                lastLocation,
                device
            )
            const authenticityToken = await this.createAuthenticityToken(loginSession.sessionId)
            return [user, loginSession, authenticityToken]
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
