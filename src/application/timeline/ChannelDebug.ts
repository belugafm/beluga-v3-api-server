import { ChannelId } from "../../domain/types"
import { IChannelTimelineQueryRepository, Parameters } from "../../domain/repository/query/ChannelTimeline"

import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateChannel"

export const ErrorCodes = {
    InternalError: "internal_error",
    NameNotMeetPolicy: "name_not_meet_policy",
    ParentNotFound: "parent_not_found",
    ...ServiceErrorCodes,
} as const

export class ChannelDebugTimelineApplication {
    private channelTimelineQueryRepository: IChannelTimelineQueryRepository
    constructor(channelTimelineQueryRepository: IChannelTimelineQueryRepository) {
        this.channelTimelineQueryRepository = channelTimelineQueryRepository
    }
    async listMessage({ channelId, limit, sortOrder, maxId, sinceId }: { channelId: ChannelId } & Parameters) {
        const messageList = await this.channelTimelineQueryRepository.listMessage({
            channelId,
            maxId,
            sinceId,
            limit,
            sortOrder,
        })
        return messageList
    }
}
