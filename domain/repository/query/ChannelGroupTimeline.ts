import { ChannelGroupdId, MessageId } from "../../types"

export const SortOrder = {
    Ascending: "ascending",
    Descending: "descending",
} as const

export type Parameters = {
    sortOrder: typeof SortOrder[keyof typeof SortOrder]
    limit: number
    sinceId?: MessageId
    maxId?: MessageId
}

export interface IChannelGroupTimelineQueryRepository {
    listMessageId(params: { channelGroupId: ChannelGroupdId } & Parameters): Promise<MessageId[]>
}
