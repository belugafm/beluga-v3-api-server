import { ChannelId, MessageId, UserId } from "../../domain/types"
import {
    CheckPermissionToPostMessageService,
    ErrorCodes as CheckPermissionToPostMessageServiceErrorCodes,
} from "../../domain/service/CheckPermissionToPostMessage"
import {
    CheckRateLimitForPostingMessageService,
    ErrorCodes as CheckRateLimitForPostingMessageServiceErrorCodes,
} from "../../domain/service/CheckRateLimitOnPostingMessage"
import { ErrorCodes as DomainErrorCodes, MessageEntity } from "../../domain/entity/Message"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IChannelCommandRepository } from "../../domain/repository/command/Channel"
import { IChannelQueryRepository } from "../../domain/repository/query/Channel"
import { IMessageCommandRepository } from "../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../domain/repository/query/Message"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { IUserQueryRepository } from "../../domain/repository/query/User"

export const ErrorCodes = {
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
    ChannelNotFound: "channel_not_found",
    ThreadNotFound: "thread_not_found",
    ArgumentMissing: "argument_missing",
    TooManyArguments: "too_many_arguments",
    TextLengthNotMeetPolicy: "text_length_not_meet_policy",
    ...CheckPermissionToPostMessageServiceErrorCodes,
    ...CheckRateLimitForPostingMessageServiceErrorCodes,
} as const

export class PostMessageApplication {
    private messageCommandRepository: IMessageCommandRepository
    private messageQueryRepository: IMessageQueryRepository
    private channelQueryRepository: IChannelQueryRepository
    private channelCommandRepository: IChannelCommandRepository
    private userQueryRepository: IUserQueryRepository
    private userCommandRepository: IUserCommandRepository
    private checkPermissionToPostMessageService: CheckPermissionToPostMessageService
    private checkRateLimitForPostingMessageService: CheckRateLimitForPostingMessageService
    constructor(
        userQueryRepository: IUserQueryRepository,
        userCommandRepository: IUserCommandRepository,
        channelQueryRepository: IChannelQueryRepository,
        channelCommandRepository: IChannelCommandRepository,
        messageQueryRepository: IMessageQueryRepository,
        messageCommandRepository: IMessageCommandRepository
    ) {
        this.messageQueryRepository = messageQueryRepository
        this.messageCommandRepository = messageCommandRepository
        this.channelQueryRepository = channelQueryRepository
        this.userQueryRepository = userQueryRepository
        this.userCommandRepository = userCommandRepository
        this.channelCommandRepository = channelCommandRepository
        this.checkPermissionToPostMessageService = new CheckPermissionToPostMessageService(
            userQueryRepository,
            channelQueryRepository
        )
        this.checkRateLimitForPostingMessageService = new CheckRateLimitForPostingMessageService(
            userQueryRepository,
            messageQueryRepository
        )
    }
    async post({
        userId,
        text,
        channelId,
        threadId,
    }: {
        userId: UserId
        text: string
        channelId?: ChannelId
        threadId?: MessageId
    }) {
        const user = await this.userQueryRepository.findById(userId)
        if (user == null) {
            throw new ApplicationError(ErrorCodes.UserNotFound)
        }
        if (channelId != null && threadId != null) {
            throw new ApplicationError(ErrorCodes.TooManyArguments)
        }
        if (channelId == null) {
            if (threadId == null) {
                throw new ApplicationError(ErrorCodes.ThreadNotFound)
            }
            const thread = await this.messageQueryRepository.findById(threadId)
            if (thread == null) {
                throw new ApplicationError(ErrorCodes.ThreadNotFound)
            }
            const channel = await this.channelQueryRepository.findById(thread.channelId)
            if (channel == null) {
                throw new ApplicationError(ErrorCodes.ChannelNotFound)
            }
            try {
                await this.checkPermissionToPostMessageService.tryCheckIfUserHasPermission(userId, channel.id)
                await this.checkRateLimitForPostingMessageService.tryCheckIfUserExceedsRateLimit(userId)
                const message = new MessageEntity({
                    id: -1,
                    text: text,
                    channelId: channel.id,
                    userId: userId,
                    createdAt: new Date(),
                    favoriteCount: 0,
                    likeCount: 0,
                    replyCount: 0,
                    threadId: threadId ? threadId : null,
                })
                message.id = await this.messageCommandRepository.add(message)

                channel.statusesCount += 1
                await this.channelCommandRepository.update(channel)

                user.statusesCount += 1
                await this.userCommandRepository.update(user)

                thread.replyCount += 1
                await this.messageCommandRepository.update(thread)

                return message
            } catch (error) {
                if (error instanceof DomainError) {
                    if (error.code === DomainErrorCodes.InvalidText) {
                        throw new ApplicationError(ErrorCodes.TextLengthNotMeetPolicy)
                    }
                    if (error.code === CheckPermissionToPostMessageServiceErrorCodes.DoNotHavePermission) {
                        throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                    }
                    if (error.code === CheckRateLimitForPostingMessageServiceErrorCodes.RateLimitExceeded) {
                        throw new ApplicationError(ErrorCodes.RateLimitExceeded)
                    }
                }
                throw new ApplicationError(ErrorCodes.InternalError)
            }
        } else if (threadId == null) {
            if (channelId == null) {
                throw new ApplicationError(ErrorCodes.ChannelNotFound)
            }
            const channel = await this.channelQueryRepository.findById(channelId)
            if (channel == null) {
                throw new ApplicationError(ErrorCodes.ChannelNotFound)
            }
            try {
                await this.checkPermissionToPostMessageService.tryCheckIfUserHasPermission(userId, channelId)
                await this.checkRateLimitForPostingMessageService.tryCheckIfUserExceedsRateLimit(userId)
                const message = new MessageEntity({
                    id: -1,
                    text: text,
                    channelId: channelId,
                    userId: userId,
                    createdAt: new Date(),
                    favoriteCount: 0,
                    likeCount: 0,
                    replyCount: 0,
                    threadId: threadId ? threadId : null,
                })
                message.id = await this.messageCommandRepository.add(message)

                channel.statusesCount += 1
                await this.channelCommandRepository.update(channel)

                user.statusesCount += 1
                await this.userCommandRepository.update(user)

                return message
            } catch (error) {
                if (error instanceof DomainError) {
                    if (error.code === DomainErrorCodes.InvalidText) {
                        throw new ApplicationError(ErrorCodes.TextLengthNotMeetPolicy)
                    }
                    if (error.code === CheckPermissionToPostMessageServiceErrorCodes.DoNotHavePermission) {
                        throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                    }
                    if (error.code === CheckRateLimitForPostingMessageServiceErrorCodes.RateLimitExceeded) {
                        throw new ApplicationError(ErrorCodes.RateLimitExceeded)
                    }
                }
                throw new ApplicationError(ErrorCodes.InternalError)
            }
        } else {
            throw new ApplicationError(ErrorCodes.ArgumentMissing)
        }
    }
}
