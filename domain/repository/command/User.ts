import { UserEntity } from "../../entity/User"
import { UserId } from "../../types"

export interface IUserCommandRepository {
    add(user: UserEntity): Promise<UserId>
    delete(user: UserEntity): Promise<boolean>
    update(user: UserEntity): Promise<boolean>
    activate(user: UserEntity): Promise<boolean>
    updateLastActivityDate(user: UserEntity, date: Date): Promise<boolean>
}
