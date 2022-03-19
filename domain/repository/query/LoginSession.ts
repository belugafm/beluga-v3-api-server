import { LoginSessionEntity } from "../../entity/LoginSession"
import { UserId } from "../../types"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface ILoginSessionQueryRepository {
    findBySessionId(sessionId: string): Promise<LoginSessionEntity | null>
    findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<LoginSessionEntity[]>
}
