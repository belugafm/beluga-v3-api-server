import { UserEntity } from "../../domain/entity/User"
import { UserId } from "../../domain/types"

export interface IUsersQueryRepository {
    findById(userId: UserId): Promise<UserEntity | null>
    findByName(name: string): Promise<UserEntity | null>
}
