import { IUserRegistrationRepository } from "../../../domain/repository/UserRegistration"

export class UserRegistrationRepository implements IUserRegistrationRepository {
    register(user: UserModel): boolean {
        return true
    }
}
