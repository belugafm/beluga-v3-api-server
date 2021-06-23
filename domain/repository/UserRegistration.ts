import { UserModel } from "../model/User"

export interface IUserRegistrationRepository {
    register(user: UserModel): boolean
}
