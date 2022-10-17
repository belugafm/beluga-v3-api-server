import { MessageId, UserId } from "../../types"

import { FavoriteEntity } from "../../entity/Favorite"

export const SortBy = {
    CreatedAt: "created_at",
} as const

export const SortOrder = {
    Ascending: "ascending",
    Descending: "descending",
} as const

export interface IFavoriteQueryRepository {
    findByMessageAndUserId(messageId: MessageId, userId: UserId): Promise<FavoriteEntity | null>
    findAllByMessageId(
        messageId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<FavoriteEntity[]>
}
