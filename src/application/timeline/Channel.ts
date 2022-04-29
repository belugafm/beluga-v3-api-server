import { ChannelId, UserId } from "../../domain/types"
import { IChannelTimelineQueryRepository, Parameters } from "../../domain/repository/query/ChannelTimeline"

import { ChannelReadStateEntity } from "../../domain/entity/ChannelReadState"
import { IChannelReadStateCommandRepository } from "../../domain/repository/command/ChannelReadState"
import { MessageEntity } from "../../domain/entity/Message"
import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateChannel"

export const ErrorCodes = {
    InternalError: "internal_error",
    NameNotMeetPolicy: "name_not_meet_policy",
    ParentNotFound: "parent_not_found",
    ...ServiceErrorCodes,
} as const

const getLatestMessage = (messageList: MessageEntity[]) => {
    if (messageList.length == 1) {
        return messageList[0]
    }
    const a = messageList[0]
    const b = messageList[messageList.length - 1]
    if (a.createdAt.getTime() > b.createdAt.getTime()) {
        return a
    }
    return b
}

export class ChannelTimelineApplication {
    private channelTimelineQueryRepository: IChannelTimelineQueryRepository
    private channelReadStateCommandRepository: IChannelReadStateCommandRepository
    constructor(
        channelTimelineQueryRepository: IChannelTimelineQueryRepository,
        channelReadStateCommandRepository: IChannelReadStateCommandRepository
    ) {
        this.channelTimelineQueryRepository = channelTimelineQueryRepository
        this.channelReadStateCommandRepository = channelReadStateCommandRepository
    }
    async listMessage({
        userId,
        channelId,
        limit,
        sortOrder,
        maxId,
        sinceId,
    }: { userId: UserId; channelId: ChannelId } & Parameters) {
        const messageList = await this.channelTimelineQueryRepository.listMessage({
            channelId,
            maxId,
            sinceId,
            limit,
            sortOrder,
        })
        if (messageList.length > 0) {
            const latestMessage = getLatestMessage(messageList)
            const readState = new ChannelReadStateEntity({
                id: -1,
                channelId,
                userId,
                lastMessageId: latestMessage.id,
            })
            await this.channelReadStateCommandRepository.upsert(readState)
        }
        return messageList
    }
}
