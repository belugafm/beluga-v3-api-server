import { UserModel } from "../model/User"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface IUsersRepository {
    add(user: UserModel): UserID
    updateProfile(user: UserModel): boolean
    delete(user: UserModel): boolean
    findById(userId: UserID): UserModel | null
    findByName(name: string): UserModel | null
    findByIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): UserModel[]
}
