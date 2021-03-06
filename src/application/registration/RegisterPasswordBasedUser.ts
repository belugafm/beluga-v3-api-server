import {
    CheckRegistrationRateLimitService,
    ErrorCodes as RegistrationRateLimitErrorCodes,
} from "../../domain/service/CheckRegistrationRateLimit"
import {
    CheckUserNameAvailabilityService,
    ErrorCodes as UserNameAvailabilityErrorCodes,
} from "../../domain/service/CheckUserNameAvailability"
import { LoginCredentialEntity, ErrorCodes as LoginCredentialErrorCodes } from "../../domain/entity/LoginCredential"
import { UserEntity, ErrorCodes as UserModelErrorCodes } from "../../domain/entity/User"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { ILoginCredentialCommandRepository } from "../../domain/repository/command/LoginCredential"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { IUserQueryRepository } from "../../domain/repository/query/User"

type Argument = {
    name: string
    password: string
    ipAddress: string
}

export const ErrorCodes = {
    InternalError: "internal_error",
    UserNameNotMeetPolicy: "user_name_not_meet_policy",
    ...RegistrationRateLimitErrorCodes,
    ...UserNameAvailabilityErrorCodes,
    PasswordNotMeetPolicy: LoginCredentialErrorCodes.PasswordNotMeetPolicy,
} as const

export class RegisterPasswordBasedUserApplication {
    private userCommandRepository: IUserCommandRepository
    // private usersQueryRepository: IUsersQueryRepository
    private loginCredentialsCommandRepository: ILoginCredentialCommandRepository
    private registrationRateLimitService: CheckRegistrationRateLimitService
    private userNameAvailabilityService: CheckUserNameAvailabilityService
    constructor(
        userQueryRepository: IUserQueryRepository,
        userCommandRepository: IUserCommandRepository,
        loginCredentialsCommandRepository: ILoginCredentialCommandRepository
    ) {
        this.userCommandRepository = userCommandRepository
        // this.usersQueryRepository = usersQueryRepository
        this.loginCredentialsCommandRepository = loginCredentialsCommandRepository
        this.registrationRateLimitService = new CheckRegistrationRateLimitService(userQueryRepository)
        this.userNameAvailabilityService = new CheckUserNameAvailabilityService(userQueryRepository)
    }
    async createUser({ name, ipAddress }: { name: string; ipAddress: string }) {
        await this.registrationRateLimitService.hasThrow(ipAddress)
        await this.userNameAvailabilityService.hasThrow(name)
        const user = new UserEntity({
            id: -1,
            name: name,
            registrationIpAddress: ipAddress,
            trustLevel: UserEntity.getInitialTrustLevel({
                signedUpWithTwitter: false,
                invitedByAuthorizedUser: false,
                twitterAccountCreatedAt: null,
            }),
        })
        user.id = await this.userCommandRepository.add(user)
        return user
    }
    async registerUser({ user, password }: { user: UserEntity; password: string }) {
        const loginCredential = await LoginCredentialEntity.new(user.id, password)
        await this.loginCredentialsCommandRepository.add(loginCredential)
        return loginCredential
    }
    async register({ name, password, ipAddress }: Argument): Promise<[UserEntity, LoginCredentialEntity]> {
        try {
            const user = await this.createUser({ name, ipAddress })
            const loginCredential = await this.registerUser({
                user,
                password,
            })
            return [user, loginCredential]
        } catch (error) {
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
