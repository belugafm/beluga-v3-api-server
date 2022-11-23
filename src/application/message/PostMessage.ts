import { ChannelId, MessageId, UserId } from "../../domain/types"
import {
    ErrorCodes as CheckPermissionToPostMessageServiceErrorCodes,
    PostMessagePermission,
} from "../../domain/permission/PostMessage"
import {
    CheckRateLimitForPostingMessageService,
    ErrorCodes as CheckRateLimitForPostingMessageServiceErrorCodes,
} from "../../domain/service/CheckRateLimitOnPostingMessage"
import { ErrorCodes as DomainErrorCodes, MessageEntity } from "../../domain/entity/Message"

import { ApplicationError } from "../ApplicationError"
import { ChannelEntity } from "../../domain/entity/Channel"
import { DomainError } from "../../domain/DomainError"
import { FileEntity } from "../../domain/entity/File"
import { IChannelCommandRepository } from "../../domain/repository/command/Channel"
import { IChannelGroupCommandRepository } from "../../domain/repository/command/ChannelGroup"
import { IChannelGroupQueryRepository } from "../../domain/repository/query/ChannelGroup"
import { IChannelGroupTimelineCommandRepository } from "../../domain/repository/command/ChannelGroupTimeline"
import { IChannelQueryRepository } from "../../domain/repository/query/Channel"
import { IFileQueryRepository } from "../../domain/repository/query/File"
import { IMessageCommandRepository } from "../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../domain/repository/query/Message"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { UserEntity } from "../../domain/entity/User"

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
    private channelGroupQueryRepository: IChannelGroupQueryRepository
    private channelGroupCommandRepository: IChannelGroupCommandRepository
    private userQueryRepository: IUserQueryRepository
    private userCommandRepository: IUserCommandRepository
    private fileQueryRepository: IFileQueryRepository
    private channelGroupTimelineCommandRepository: IChannelGroupTimelineCommandRepository
    private permissionToPostMessageService: PostMessagePermission
    private checkRateLimitForPostingMessageService: CheckRateLimitForPostingMessageService
    constructor(
        userQueryRepository: IUserQueryRepository,
        userCommandRepository: IUserCommandRepository,
        channelQueryRepository: IChannelQueryRepository,
        channelCommandRepository: IChannelCommandRepository,
        channelGroupQueryRepository: IChannelGroupQueryRepository,
        channelGroupCommandRepository: IChannelGroupCommandRepository,
        messageQueryRepository: IMessageQueryRepository,
        messageCommandRepository: IMessageCommandRepository,
        fileQueryRepository: IFileQueryRepository,
        channelGroupTimelineCommandRepository: IChannelGroupTimelineCommandRepository
    ) {
        this.messageQueryRepository = messageQueryRepository
        this.messageCommandRepository = messageCommandRepository
        this.channelQueryRepository = channelQueryRepository
        this.channelCommandRepository = channelCommandRepository
        this.channelGroupQueryRepository = channelGroupQueryRepository
        this.channelGroupCommandRepository = channelGroupCommandRepository
        this.userQueryRepository = userQueryRepository
        this.userCommandRepository = userCommandRepository
        this.fileQueryRepository = fileQueryRepository
        this.channelGroupTimelineCommandRepository = channelGroupTimelineCommandRepository
        this.permissionToPostMessageService = new PostMessagePermission(userQueryRepository, channelQueryRepository)
        this.checkRateLimitForPostingMessageService = new CheckRateLimitForPostingMessageService(
            userQueryRepository,
            messageQueryRepository
        )
    }
    async findMediaUrls(text: string): Promise<FileEntity[]> {
        const ret: FileEntity[] = []
        const regexp = FileEntity.getMediaUrlRegexp()
        const results = text.match(regexp)
        if (results == null) {
            return []
        }
        for (const url of results) {
            const path = FileEntity.getPathFromUrl(url)
            const file = await this.fileQueryRepository.findByPath(path)
            if (file == null) {
                continue
            }
            if (file.original !== true) {
                continue
            }
            ret.push(file)
        }
        return ret
    }
    async _postMessage({
        text,
        textStyle,
        user,
        channel,
        thread,
    }: {
        text: string
        textStyle?: string
        user: UserEntity
        channel: ChannelEntity
        thread?: MessageEntity
    }): Promise<MessageEntity> {
        const message = new MessageEntity({
            id: -1,
            text: text,
            textStyle: textStyle,
            channelId: channel.id,
            userId: user.id,
            createdAt: new Date(),
            favoriteCount: 0,
            likeCount: 0,
            replyCount: 0,
            threadId: thread ? thread.id : null,
        })

        await this.permissionToPostMessageService.hasThrow(user.id, channel.id)
        await this.checkRateLimitForPostingMessageService.hasThrow(user.id)

        message.id = await this.messageCommandRepository.add(message)

        channel.messageCount += 1
        channel.lastMessageId = message.id
        channel.lastMessageCreatedAt = message.createdAt
        await this.channelCommandRepository.update(channel)

        user.messageCount += 1
        await this.userCommandRepository.update(user)

        if (thread) {
            thread.replyCount += 1
            thread.lastReplyMessageId = message.id
            thread.lastReplyMessageCreatedAt = message.createdAt
            await this.messageCommandRepository.update(thread)
        }

        let parentChannelGroupId: number | null = channel.parentChannelGroupId
        let parentChannelGroup = parentChannelGroupId
            ? await this.channelGroupQueryRepository.findById(parentChannelGroupId)
            : null
        while (parentChannelGroup) {
            // Update channel group
            parentChannelGroup.lastMessageId = message.id
            parentChannelGroup.lastMessageCreatedAt = message.createdAt
            await this.channelGroupCommandRepository.update(parentChannelGroup)

            // Update timeline
            await this.channelGroupTimelineCommandRepository.add(message, parentChannelGroup)

            parentChannelGroupId = parentChannelGroup.parentId
            parentChannelGroup = parentChannelGroupId
                ? await this.channelGroupQueryRepository.findById(parentChannelGroupId)
                : null
        }

        const attachedFiles = await this.findMediaUrls(text)
        for (const file of attachedFiles) {
            console.log(file)
        }

        return message
    }
    async post({
        userId,
        text,
        textStyle,
        channelId,
        threadId,
    }: {
        userId: UserId
        text: string
        textStyle?: string
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
        try {
            if (channelId == null) {
                if (threadId == null) {
                    throw new ApplicationError(ErrorCodes.ArgumentMissing)
                }
                const thread = await this.messageQueryRepository.findById(threadId)
                if (thread == null) {
                    throw new ApplicationError(ErrorCodes.ThreadNotFound)
                }
                const channel = await this.channelQueryRepository.findById(thread.channelId)
                if (channel == null) {
                    throw new ApplicationError(ErrorCodes.ChannelNotFound)
                }
                return await this._postMessage({
                    text,
                    textStyle,
                    user,
                    channel,
                    thread,
                })
            } else if (threadId == null) {
                if (channelId == null) {
                    throw new ApplicationError(ErrorCodes.ArgumentMissing)
                }
                const channel = await this.channelQueryRepository.findById(channelId)
                if (channel == null) {
                    throw new ApplicationError(ErrorCodes.ChannelNotFound)
                }
                return await this._postMessage({
                    text,
                    textStyle,
                    user,
                    channel,
                })
            } else {
                throw new ApplicationError(ErrorCodes.ArgumentMissing)
            }
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
            if (error instanceof ApplicationError) {
                throw error
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
