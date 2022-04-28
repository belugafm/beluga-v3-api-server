import { ChannelGroupdId, ChannelId, UserId } from "../../types"

import { ChannelEntity } from "../../entity/Channel"

export const SortBy = {
    CreatedAt: "created_at",
    messageCount: "message_count",
} as const

export const SortOrder = {
    Ascending: "ascending",
    Descending: "descending",
} as const

export interface IChannelQueryRepository {
    findById(channelId: ChannelId): Promise<ChannelEntity | null>
    findByUniqueName(uniqueName: string): Promise<ChannelEntity | null>
    findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelEntity[]>
    findByParentChannelGroupId(
        channelGroupId: ChannelGroupdId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelEntity[]>
    list(
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelEntity[]>
}
