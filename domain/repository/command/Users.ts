import { UserEntity } from "../../entity/User"
import { UserId } from "../../types"

export interface IUsersCommandRepository {
    add(user: UserEntity): Promise<UserId>
    delete(user: UserEntity): Promise<boolean>
    update(user: UserEntity): Promise<boolean>
}