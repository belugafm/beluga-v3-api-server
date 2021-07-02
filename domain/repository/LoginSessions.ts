import { LoginSessionEntity } from "../entity/LoginSession"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface ILoginSessionsRepository {
    add(session: LoginSessionEntity): Promise<void>
    deleteAll(userId: UserId): Promise<number>
    findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<LoginSessionEntity[]>
}
