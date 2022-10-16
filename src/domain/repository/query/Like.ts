import { MessageId, UserId } from "../../types"

import { LikeEntity } from "../../entity/Like"

export const SortBy = {
    UpdatedAt: "updated_at",
} as const

export const SortOrder = {
    Ascending: "ascending",
    Descending: "descending",
} as const

export interface ILikeQueryRepository {
    findByMessageAndUserId(messageId: MessageId, userId: UserId): Promise<LikeEntity | null>
    findAllByMessageId(
        messageId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<LikeEntity[]>
}
