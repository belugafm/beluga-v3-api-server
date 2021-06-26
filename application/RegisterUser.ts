import { DomainError } from "../domain/error"
import {
    LoginCredentialEntity,
    ErrorCodes as LoginCredentialErrorCodes,
} from "../domain/entity/LoginCredential"
import { LoginSessionEntity } from "../domain/entity/LoginSession"
import { UserEntity, ErrorCodes as UserModelErrorCodes } from "../domain/entity/User"
import { IUserRegistrationRepository } from "../domain/repository/UserRegistration"
import { IUsersRepository } from "../domain/repository/Users"
import {
    CheckRegistrationRateLimitService,
    ErrorCodes as RegistrationRateLimitErrorCodes,
} from "../domain/service/CheckRegistrationRateLimit"
import {
    CheckUserNameAvailabilityService,
    ErrorCodes as UserNameAvailabilityErrorCodes,
} from "../domain/service/CheckUserNameAvailability"
import { ApplicationError } from "./error"

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

export class RegisterUserApplication {
    private usersRepository: IUsersRepository
    private userRegistrationRepository: IUserRegistrationRepository
    private registrationRateLimitService: CheckRegistrationRateLimitService
    private userNameAvailabilityService: CheckUserNameAvailabilityService
    constructor(
        usersRepository: IUsersRepository,
        userRegistrationRepository: IUserRegistrationRepository
    ) {
        this.usersRepository = usersRepository
        this.userRegistrationRepository = userRegistrationRepository
        this.registrationRateLimitService = new CheckRegistrationRateLimitService(usersRepository)
        this.userNameAvailabilityService = new CheckUserNameAvailabilityService(usersRepository)
    }
    async register({ name, password, ipAddress }: Argument): UserEntity {
        try {
            this.registrationRateLimitService.tryCheckIfRateIsLimited(ipAddress)
            this.userNameAvailabilityService.tryCheckIfNameIsTaken(name)
            const user = new UserEntity(-1, name)
            user.id = await this.usersRepository.add(user)
            try {
                user.loginCredential = await LoginCredentialEntity.new(user.id, password)
                user.LoginSession = LoginSessionEntity.new(user.id, ipAddress)
                this.userRegistrationRepository.register(user)
            } catch (error) {
                await this.usersRepository.delete(user)
                throw error
            }
            return user
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
