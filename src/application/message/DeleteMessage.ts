import { MessageId, UserId } from "../../domain/types"

import { ApplicationError } from "../ApplicationError"
import { DeleteMessagePermission } from "../../domain/permission/DeleteMessage"
import { DomainError } from "../../domain/DomainError"
import { IChannelCommandRepository } from "../../domain/repository/command/Channel"
import { IChannelGroupTimelineCommandRepository } from "../../domain/repository/command/ChannelGroupTimeline"
import { IChannelQueryRepository } from "../../domain/repository/query/Channel"
import { IMessageCommandRepository } from "../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../domain/repository/query/Message"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { ErrorCodes as PermissionErrorCodes } from "../../domain/permission/DeleteMessage"

export const ErrorCodes = {
    InternalError: "internal_error",
    RequestUserNotFound: "request_user_not_found",
    MessageNotFound: "message_not_found",
    ChannelNotFound: "channel_not_found",
    ...PermissionErrorCodes,
} as const

export class DeleteMessageApplication {
    private messageCommandRepository: IMessageCommandRepository
    private messageQueryRepository: IMessageQueryRepository
    private channelQueryRepository: IChannelQueryRepository
    private channelCommandRepository: IChannelCommandRepository
    private userQueryRepository: IUserQueryRepository
    private userCommandRepository: IUserCommandRepository
    private channelGroupTimelineCommandRepository: IChannelGroupTimelineCommandRepository
    private permissionToDeleteMessage: DeleteMessagePermission
    constructor(
        userQueryRepository: IUserQueryRepository,
        userCommandRepository: IUserCommandRepository,
        channelQueryRepository: IChannelQueryRepository,
        channelCommandRepository: IChannelCommandRepository,
        messageQueryRepository: IMessageQueryRepository,
        messageCommandRepository: IMessageCommandRepository,
        channelGroupTimelineCommandRepository: IChannelGroupTimelineCommandRepository
    ) {
        this.messageQueryRepository = messageQueryRepository
        this.messageCommandRepository = messageCommandRepository
        this.channelQueryRepository = channelQueryRepository
        this.channelCommandRepository = channelCommandRepository
        this.userQueryRepository = userQueryRepository
        this.userCommandRepository = userCommandRepository
        this.channelGroupTimelineCommandRepository = channelGroupTimelineCommandRepository
        this.permissionToDeleteMessage = new DeleteMessagePermission(userQueryRepository, messageQueryRepository)
    }
    async delete({ messageId, requestUserId }: { messageId: MessageId; requestUserId: UserId }): Promise<boolean> {
        const requestUser = await this.userQueryRepository.findById(requestUserId)
        if (requestUser == null) {
            throw new ApplicationError(ErrorCodes.RequestUserNotFound)
        }
        const message = await this.messageQueryRepository.findById(messageId)
        if (message == null) {
            throw new ApplicationError(ErrorCodes.MessageNotFound)
        }
        const channel = await this.channelQueryRepository.findById(message.channelId)
        if (channel == null) {
            throw new ApplicationError(ErrorCodes.ChannelNotFound)
        }
        try {
            await this.permissionToDeleteMessage.hasThrow(requestUserId, messageId)
            message.deleted = true
            await this.messageCommandRepository.update(message)

            requestUser.messageCount -= 1
            await this.userCommandRepository.update(requestUser)

            channel.messageCount -= 1
            const latestMessage = await this.messageQueryRepository.findLatestForChannel(channel.id)
            channel.lastMessageId = latestMessage ? latestMessage.id : null
            await this.channelCommandRepository.update(channel)

            await this.channelGroupTimelineCommandRepository.delete(message)

            return true
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === PermissionErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
