import {
    CheckRegistrationRateLimitService,
    ErrorCodes as RegistrationRateLimitErrorCodes,
} from "../../domain/service/CheckRegistrationRateLimit"
import {
    CheckUserNameAvailabilityService,
    ErrorCodes as UserNameAvailabilityErrorCodes,
} from "../../domain/service/CheckUserNameAvailability"
import {
    LoginCredentialEntity,
    ErrorCodes as LoginCredentialErrorCodes,
} from "../../domain/entity/LoginCredential"
import { UserEntity, ErrorCodes as UserModelErrorCodes } from "../../domain/entity/User"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { GetInitialTrustLevelService } from "../../domain/service/GetInitialTrustLevel"
import { ILoginCredentialsCommandRepository } from "../../domain/repository/command/LoginCredentials"
import { IUsersCommandRepository } from "../../domain/repository/command/Users"
import { IUsersQueryRepository } from "../../domain/repository/query/Users"

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
    private usersCommandRepository: IUsersCommandRepository
    // private usersQueryRepository: IUsersQueryRepository
    private loginCredentialsCommandRepository: ILoginCredentialsCommandRepository
    private registrationRateLimitService: CheckRegistrationRateLimitService
    private userNameAvailabilityService: CheckUserNameAvailabilityService
    constructor(
        usersQueryRepository: IUsersQueryRepository,
        usersCommandRepository: IUsersCommandRepository,
        loginCredentialsCommandRepository: ILoginCredentialsCommandRepository
    ) {
        this.usersCommandRepository = usersCommandRepository
        // this.usersQueryRepository = usersQueryRepository
        this.loginCredentialsCommandRepository = loginCredentialsCommandRepository
        this.registrationRateLimitService = new CheckRegistrationRateLimitService(
            usersQueryRepository
        )
        this.userNameAvailabilityService = new CheckUserNameAvailabilityService(
            usersQueryRepository
        )
    }
    async createUser({ name, ipAddress }: { name: string; ipAddress: string }) {
        await this.registrationRateLimitService.tryCheckIfRateIsLimited(ipAddress)
        await this.userNameAvailabilityService.tryCheckIfNameIsTaken(name)
        const user = new UserEntity({
            id: -1,
            name: name,
            registrationIpAddress: ipAddress,
            trustLevel: GetInitialTrustLevelService.getTrustLevel({
                signedUpWithTwitter: false,
                invitedByAuthorizedUser: false,
                twitterAccountCreatedAt: null,
            }),
        })
        user.id = await this.usersCommandRepository.add(user)
        return user
    }
    async registerUser({ user, password }: { user: UserEntity; password: string }) {
        const loginCredential = await LoginCredentialEntity.new(user.id, password)
        await this.loginCredentialsCommandRepository.add(loginCredential)
        return loginCredential
    }
    async register({
        name,
        password,
        ipAddress,
    }: Argument): Promise<[UserEntity, LoginCredentialEntity]> {
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
