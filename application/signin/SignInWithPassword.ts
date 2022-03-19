import { ApplicationError } from "../ApplicationError"
import { AuthenticityTokenEntity } from "../../domain/entity/AuthenticityToken"
import { IAuthenticityTokenCommandRepository } from "../../domain/repository/command/AuthenticityToken"
import { ILoginCredentialQueryRepository } from "../../domain/repository/query/LoginCredential"
import { ILoginSessionCommandRepository } from "../../domain/repository/command/LoginSession"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { LoginCredentialEntity } from "../../domain/entity/LoginCredential"
import { LoginSessionEntity } from "../../domain/entity/LoginSession"
import { UserEntity } from "../../domain/entity/User"
import { UserId } from "../../domain/types"
import bcrypt from "bcrypt"

type Argument = {
    name: string
    password: string
    ipAddress: string
    lastLocation: string | null
    device: string | null
}

export const ErrorCodes = {
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
    IncorrectPassword: "incorrect_password",
} as const

export class SignInWithPasswordApplication {
    private usersQueryRepository: IUserQueryRepository
    private loginCredentialsQueryRepository: ILoginCredentialQueryRepository
    private loginSessionCommandRepository: ILoginSessionCommandRepository
    private authenticityTokenCommandRepository: IAuthenticityTokenCommandRepository
    constructor(
        usersQueryRepository: IUserQueryRepository,
        loginCredentialsQueryRepository: ILoginCredentialQueryRepository,
        loginSessionCommandRepository: ILoginSessionCommandRepository,
        authenticityTokenCommandRepository: IAuthenticityTokenCommandRepository
    ) {
        this.usersQueryRepository = usersQueryRepository
        this.loginCredentialsQueryRepository = loginCredentialsQueryRepository
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
        name,
        password,
        ipAddress,
        lastLocation,
        device,
    }: Argument): Promise<
        [UserEntity, LoginCredentialEntity, LoginSessionEntity, AuthenticityTokenEntity]
    > {
        try {
            const user = await this.usersQueryRepository.findByName(name)
            if (user == null) {
                throw new ApplicationError(ErrorCodes.UserNotFound)
            }
            const loginCredential = await this.loginCredentialsQueryRepository.findByUserId(user.id)
            if (loginCredential == null) {
                throw new ApplicationError(ErrorCodes.InternalError)
            }
            const match = await bcrypt.compare(password, loginCredential.passwordHash)
            if (match == false) {
                throw new ApplicationError(ErrorCodes.IncorrectPassword)
            }
            const loginSession = await this.createLoginSession(
                user.id,
                ipAddress,
                lastLocation,
                device
            )
            const authenticityToken = await this.createAuthenticityToken(loginSession.sessionId)
            return [user, loginCredential, loginSession, authenticityToken]
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
