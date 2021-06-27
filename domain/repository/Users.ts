import { UserEntity } from "../entity/User"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface IUsersRepository {
    add(user: UserEntity): Promise<UserId>
    delete(userId: UserId): Promise<boolean>
    updateProfile(user: UserEntity): Promise<boolean>
    findById(userId: UserId): Promise<UserEntity | null>
    findByName(name: string): Promise<UserEntity | null>
    findByIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<UserEntity[]>
}
