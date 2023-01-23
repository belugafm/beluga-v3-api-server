import { MessageId, UserId } from "../../domain/types"

import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateChannel"
import { IThreadTimelineQueryRepository, Parameters } from "../../domain/repository/query/ThreadTimeline"

export const ErrorCodes = {
    InternalError: "internal_error",
    NameNotMeetPolicy: "name_not_meet_policy",
    ParentNotFound: "parent_not_found",
    ...ServiceErrorCodes,
} as const

export class ThreadTimelineApplication {
    private threadTimelineQueryRepository: IThreadTimelineQueryRepository
    constructor(threadTimelineQueryRepository: IThreadTimelineQueryRepository) {
        this.threadTimelineQueryRepository = threadTimelineQueryRepository
    }
    async listMessage({
        userId,
        messageId,
        limit,
        sortOrder,
        maxId,
        sinceId,
    }: { userId: UserId; messageId: MessageId } & Parameters) {
        const messageList = await this.threadTimelineQueryRepository.listMessage({
            messageId,
            maxId,
            sinceId,
            limit,
            sortOrder,
        })
        return messageList
    }
}
