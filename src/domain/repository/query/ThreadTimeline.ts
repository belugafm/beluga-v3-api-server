import { MessageEntity } from "../../entity/Message"
import { MessageId } from "../../types"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export type Parameters = {
    sortOrder: typeof SortOrder[keyof typeof SortOrder]
    limit: number
    sinceId?: MessageId
    maxId?: MessageId
}

export interface IThreadTimelineQueryRepository {
    listMessage(params: { messageId: MessageId } & Parameters): Promise<MessageEntity[]>
}
