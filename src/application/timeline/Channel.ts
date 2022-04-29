import { ChannelId, UserId } from "../../domain/types"
import { IChannelTimelineQueryRepository, Parameters } from "../../domain/repository/query/ChannelTimeline"

import { ChannelReadStateEntity } from "../../domain/entity/ChannelReadState"
import { IChannelReadStateCommandRepository } from "../../domain/repository/command/ChannelReadState"
import { IChannelReadStateQueryRepository } from "../../domain/repository/query/ChannelReadState"
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
    private channelReadStateQueryRepository: IChannelReadStateQueryRepository
    private channelReadStateCommandRepository: IChannelReadStateCommandRepository
    constructor(
        channelTimelineQueryRepository: IChannelTimelineQueryRepository,
        channelReadStateQueryRepository: IChannelReadStateQueryRepository,
        channelReadStateCommandRepository: IChannelReadStateCommandRepository
    ) {
        this.channelTimelineQueryRepository = channelTimelineQueryRepository
        this.channelReadStateQueryRepository = channelReadStateQueryRepository
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
            const oldReadState = await this.channelReadStateQueryRepository.find(channelId, userId)
            const newReadState = new ChannelReadStateEntity({
                id: -1,
                channelId,
                userId,
                lastMessageId: latestMessage.id,
            })
            if (oldReadState == null) {
                await this.channelReadStateCommandRepository.upsert(newReadState)
            } else {
            }
            a
        }
        return messageList
    }
}
