import { ChannelEntity } from "../../entity/Channel"
import { ChannelGroupEntity } from "../../entity/ChannelGroup"
import { ChannelGroupdId } from "../../types"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface IChannelGroupQueryRepository {
    findById(id: ChannelGroupdId): Promise<ChannelGroupEntity | null>
    findByUniqueName(uniqueName: string): Promise<ChannelGroupEntity | null>
    listChannels(
        id: ChannelGroupdId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelEntity[]>
    listChannelGroups(
        id: ChannelGroupdId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelGroupEntity[]>
}
