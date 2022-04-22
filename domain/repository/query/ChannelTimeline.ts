import { ChannelId, MessageId } from "../../types"

import { MessageEntity } from "../../entity/Message"

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export type Parameters = {
    sortOrder: keyof typeof SortOrder
    limit: number
    sinceId?: MessageId
    maxId?: MessageId
}

export interface IChannelTimelineQueryRepository {
    listMessage(params: { channelId: ChannelId } & Parameters): Promise<MessageEntity[]>
}
