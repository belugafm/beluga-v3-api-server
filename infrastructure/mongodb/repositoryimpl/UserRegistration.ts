import { IUserRegistrationRepository } from "../../../domain/repository/UserRegistration"
import { UserEntity } from "../../../domain/entity/User"

export class UserRegistrationRepository implements IUserRegistrationRepository {
    register(user: UserEntity): boolean {
        return true
    }
}
