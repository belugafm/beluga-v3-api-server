import { LoginCredentialModel } from "../domain/model/LoginCredential"
import { LoginSessionModel } from "../domain/model/LoginSession"
import { UserModel } from "../domain/model/User"
import { IUserRegistrationRepository } from "../domain/repository/UserRegistration"
import { IUsersRepository } from "../domain/repository/Users"
import { CheckRegistrationRateLimitService } from "../domain/service/CheckRegistrationRateLimit"
import { CheckUserNameAvailabilityService } from "../domain/service/CheckUserNameAvailability"

type Argument = {
    name: string
    password: string
    ipAddress: string
}

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
        this.registrationRateLimitService =
            new CheckRegistrationRateLimitService(usersRepository)
        this.userNameAvailabilityService = new CheckUserNameAvailabilityService(
            usersRepository
        )
    }
    async register({ name, password, ipAddress }: Argument): UserModel {
        this.registrationRateLimitService.tryCheckIfRateIsLimited(ipAddress)
        this.userNameAvailabilityService.tryCheckIfNameIsTaken(name)
        const user = new UserModel(-1, name)
        user.id = this.usersRepository.add(user)
        try {
            user.loginCredential = await LoginCredentialModel.new(
                user.id,
                password
            )
            user.LoginSession = LoginSessionModel.new(user.id, ipAddress)
            this.userRegistrationRepository.register(user)
        } catch (error) {
            this.usersRepository.delete(user)
            throw error
        }
        return user
    }
}
