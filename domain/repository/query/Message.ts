import { MessageId, UserId } from "../../types"

import { MessageEntity } from "../../entity/Message"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface IMessageQueryRepository {
    findById(id: MessageId): Promise<MessageEntity | null>
    findLastForUser(userId: UserId): Promise<MessageEntity | null>
}
