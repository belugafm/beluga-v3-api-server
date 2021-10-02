import { UserEntity } from "../../entity/User"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface IUsersQueryRepository {
    findById(userId: UserId): Promise<UserEntity | null>
    findByName(name: string): Promise<UserEntity | null>
    findByRegistrationIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<UserEntity[]>
}
