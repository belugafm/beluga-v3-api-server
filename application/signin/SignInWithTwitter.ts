import { ApplicationError } from "../ApplicationError"
import { AuthenticityTokenEntity } from "../../domain/entity/AuthenticityToken"
import { IAuthenticityTokenCommandRepository } from "../../domain/repository/command/AuthenticityToken"
import { ILoginSessionCommandRepository } from "../../domain/repository/command/LoginSession"
import { IUserQueryRepository } from "../../domain/repository/query/User"
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
    private userQueryRepository: IUserQueryRepository
    private loginSessionCommandRepository: ILoginSessionCommandRepository
    private authenticityTokenCommandRepository: IAuthenticityTokenCommandRepository
    constructor(
        userQueryRepository: IUserQueryRepository,
        loginSessionCommandRepository: ILoginSessionCommandRepository,
        authenticityTokenCommandRepository: IAuthenticityTokenCommandRepository
    ) {
        this.userQueryRepository = userQueryRepository
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
            const user = await this.userQueryRepository.findByTwitterUserId(twitterUserId)
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
