import { UserEntity } from "../../domain/entity/User"

export interface IUsersQueryRepository {
    findById(userId: UserId): Promise<UserEntity | null>
    findByName(name: string): Promise<UserEntity | null>
}
