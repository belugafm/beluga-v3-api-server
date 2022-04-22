import { MessageId, UserId } from "../../../types"

import { MessageEntity } from "../../../entity/Message"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export type Parameters = {
    sortBy: keyof typeof SortBy
    sortOrder: keyof typeof SortOrder
    limit: number
    sinceId?: MessageId
    maxId?: MessageId
}

export interface IHomeTimelineQueryRepository {
    listMessage(params: { userId: UserId } & Parameters): Promise<MessageEntity[]>
}
