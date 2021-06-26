import { UserEntity } from "../entity/User"

export interface IUserRegistrationRepository {
    register(user: UserEntity): boolean
}
