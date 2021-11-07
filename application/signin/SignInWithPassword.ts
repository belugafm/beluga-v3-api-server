import { ApplicationError } from "../ApplicationError"
import { ILoginCredentialsQueryRepository } from "../../domain/repository/query/LoginCredentials"
import { ILoginSessionsCommandRepository } from "../../domain/repository/command/LoginSessions"
import { IUsersQueryRepository } from "../../domain/repository/query/Users"
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
    private usersQueryRepository: IUsersQueryRepository
    private loginCredentialsQueryRepository: ILoginCredentialsQueryRepository
    private loginSessionCommandRepository: ILoginSessionsCommandRepository
    constructor(
        usersQueryRepository: IUsersQueryRepository,
        loginCredentialsQueryRepository: ILoginCredentialsQueryRepository,
        loginSessionCommandRepository: ILoginSessionsCommandRepository
    ) {
        this.usersQueryRepository = usersQueryRepository
        this.loginCredentialsQueryRepository = loginCredentialsQueryRepository
        this.loginSessionCommandRepository = loginSessionCommandRepository
    }
    async createSession(
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
    async signin({
        name,
        password,
        ipAddress,
        lastLocation,
        device,
    }: Argument): Promise<[UserEntity, LoginCredentialEntity, LoginSessionEntity]> {
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
            const loginSession = await this.createSession(user.id, ipAddress, lastLocation, device)
            return [user, loginCredential, loginSession]
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
