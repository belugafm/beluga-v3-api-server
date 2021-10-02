import { UserEntity } from "../../entity/User"

export interface IUsersCommandRepository {
    add(user: UserEntity): Promise<UserId>
    delete(user: UserEntity): Promise<boolean>
    update(user: UserEntity): Promise<boolean>
}
