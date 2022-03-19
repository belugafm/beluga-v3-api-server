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
    findById(channelId: ChannelGroupdId): Promise<ChannelGroupEntity | null>
    findByUniqueName(uniqueName: string): Promise<ChannelGroupEntity | null>
}
