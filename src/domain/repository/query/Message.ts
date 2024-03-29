import { ChannelId, MessageId, UserId } from "../../types"

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
    findLatestForUser(userId: UserId): Promise<MessageEntity | null>
    findLatestForChannel(channelId: ChannelId): Promise<MessageEntity | null>
    search(params: {
        text: string
        channelId?: ChannelId
        userId?: UserId
        sinceId?: MessageId
        maxId?: MessageId
        sinceDate?: number
        untilDate?: number
        limit?: number
        sortBy?: typeof SortBy[keyof typeof SortBy]
        sortOrder?: typeof SortOrder[keyof typeof SortOrder]
    }): Promise<MessageEntity[]>
}
