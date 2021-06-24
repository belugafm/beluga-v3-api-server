import { DomainError } from "../domain/error"
import {
    LoginCredentialModel,
    ErrorCodes as LoginCredentialErrorCodes,
} from "../domain/model/LoginCredential"
import { LoginSessionModel } from "../domain/model/LoginSession"
import { UserModel, ErrorCodes as UserModelErrorCodes } from "../domain/model/User"
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
    async register({ name, password, ipAddress }: Argument): UserModel {
        try {
            this.registrationRateLimitService.tryCheckIfRateIsLimited(ipAddress)
            this.userNameAvailabilityService.tryCheckIfNameIsTaken(name)
            const user = new UserModel(-1, name)
            user.id = this.usersRepository.add(user)
            try {
                user.loginCredential = await LoginCredentialModel.new(user.id, password)
                user.LoginSession = LoginSessionModel.new(user.id, ipAddress)
                this.userRegistrationRepository.register(user)
            } catch (error) {
                this.usersRepository.delete(user)
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
