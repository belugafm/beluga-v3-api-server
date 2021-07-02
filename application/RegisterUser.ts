import {
    CheckRegistrationRateLimitService,
    ErrorCodes as RegistrationRateLimitErrorCodes,
} from "../domain/service/CheckRegistrationRateLimit"
import {
    CheckUserNameAvailabilityService,
    ErrorCodes as UserNameAvailabilityErrorCodes,
} from "../domain/service/CheckUserNameAvailability"
import {
    LoginCredentialEntity,
    ErrorCodes as LoginCredentialErrorCodes,
} from "../domain/entity/LoginCredential"
import { UserEntity, ErrorCodes as UserModelErrorCodes } from "../domain/entity/User"

import { ApplicationError } from "./ApplicationError"
import { DomainError } from "../domain/DomainError"
import { ILoginCredentialsRepository } from "../domain/repository/LoginCredentials"
import { ILoginSessionsRepository } from "../domain/repository/LoginSessions"
import { IUsersRepository } from "../domain/repository/Users"
import { LoginSessionEntity } from "../domain/entity/LoginSession"

type Argument = {
    name: string
    password: string
    ipAddress: string
    lastLocation: string | null
    device: string | null
}

export const ErrorCodes = {
    InternalError: "internal_error",
    UserNameNotMeetPolicy: "user_name_not_meet_policy",
    ...RegistrationRateLimitErrorCodes,
    ...UserNameAvailabilityErrorCodes,
    PasswordNotMeetPolicy: LoginCredentialErrorCodes.PasswordNotMeetPolicy,
} as const

export class RegisterUserApplication {
    private usersRepository: IUsersRepository
    private loginCredentialsRepository: ILoginCredentialsRepository
    private loginSessionsRepository: ILoginSessionsRepository
    private registrationRateLimitService: CheckRegistrationRateLimitService
    private userNameAvailabilityService: CheckUserNameAvailabilityService
    constructor(
        usersRepository: IUsersRepository,
        loginCredentialsRepository: ILoginCredentialsRepository,
        loginSessionsRepository: ILoginSessionsRepository
    ) {
        this.usersRepository = usersRepository
        this.loginCredentialsRepository = loginCredentialsRepository
        this.loginSessionsRepository = loginSessionsRepository
        this.registrationRateLimitService = new CheckRegistrationRateLimitService(usersRepository)
        this.userNameAvailabilityService = new CheckUserNameAvailabilityService(usersRepository)
    }
    async createUser({ name, ipAddress }: { name: string; ipAddress: string }) {
        await this.registrationRateLimitService.tryCheckIfRateIsLimited(ipAddress)
        await this.userNameAvailabilityService.tryCheckIfNameIsTaken(name)
        const user = new UserEntity({
            id: -1,
            name: name,
            registrationIpAddress: ipAddress,
        })
        user.id = await this.usersRepository.add(user)
        return user
    }
    async registerUser({
        user,
        password,
        ipAddress,
        lastLocation,
        device,
    }: {
        user: UserEntity
        password: string
        ipAddress: string
        lastLocation: string | null
        device: string | null
    }) {
        const loginCredential = await LoginCredentialEntity.new(user.id, password)
        const loginSession = new LoginSessionEntity({
            userId: user.id,
            ipAddress,
            lastLocation,
            device,
        })
        await this.loginCredentialsRepository.add(loginCredential)
        await this.loginSessionsRepository.add(loginSession)
        return { loginCredential, loginSession }
    }
    async register({
        name,
        password,
        ipAddress,
        lastLocation,
        device,
    }: Argument): Promise<UserEntity> {
        try {
            const user = await this.createUser({ name, ipAddress })
            const { loginCredential, loginSession } = await this.registerUser({
                user,
                password,
                ipAddress,
                lastLocation,
                device,
            })
            user.loginCredential = loginCredential
            user.loginSession = loginSession
            return user
        } catch (error) {
            console.log(error)
            console.log(error.stack)
            if (error instanceof DomainError) {
                if (error.code === RegistrationRateLimitErrorCodes.TooManyRequests) {
                    throw new ApplicationError(ErrorCodes.TooManyRequests)
                }
                if (error.code === UserModelErrorCodes.InvalidName) {
                    throw new ApplicationError(ErrorCodes.UserNameNotMeetPolicy)
                }
                if (error.code === UserNameAvailabilityErrorCodes.NameTaken) {
                    throw new ApplicationError(ErrorCodes.NameTaken)
                }
                if (error.code === LoginCredentialErrorCodes.PasswordNotMeetPolicy) {
                    throw new ApplicationError(ErrorCodes.PasswordNotMeetPolicy)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
