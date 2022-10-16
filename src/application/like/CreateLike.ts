import { MessageId, UserId } from "../../domain/types"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IMessageCommandRepository } from "../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../domain/repository/query/Message"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { ILikeQueryRepository } from "../../domain/repository/query/Like"
import { ILikeCommandRepository } from "../../domain/repository/command/Like"
import { CreateLikePermission, ErrorCodes as PermissionErrorCodes } from "../../domain/permission/CreateLike"
import { LikeEntity, ErrorCodes as DomainErrorCodes } from "../../domain/entity/Like"

export const ErrorCodes = {
    InternalError: "internal_error",
    RequestUserNotFound: "request_user_not_found",
    MessageNotFound: "message_not_found",
    ReachedMaxCount: "reached_max_count",
    ...PermissionErrorCodes,
} as const

export class CreateLikeApplication {
    private messageCommandRepository: IMessageCommandRepository
    private messageQueryRepository: IMessageQueryRepository
    private userQueryRepository: IUserQueryRepository
    private likeQueryRepository: ILikeQueryRepository
    private likeCommandRepository: ILikeCommandRepository
    private permissionToCreateLike: CreateLikePermission
    constructor(
        userQueryRepository: IUserQueryRepository,
        messageQueryRepository: IMessageQueryRepository,
        messageCommandRepository: IMessageCommandRepository,
        likeQueryRepository: ILikeQueryRepository,
        likeCommandRepository: ILikeCommandRepository
    ) {
        this.userQueryRepository = userQueryRepository
        this.messageQueryRepository = messageQueryRepository
        this.messageCommandRepository = messageCommandRepository
        this.likeQueryRepository = likeQueryRepository
        this.likeCommandRepository = likeCommandRepository
        this.permissionToCreateLike = new CreateLikePermission(userQueryRepository, messageQueryRepository)
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
        try {
            await this.permissionToCreateLike.hasThrow(requestUserId, messageId)
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === PermissionErrorCodes.CanNotLikeYourOwnMessage) {
                    throw new ApplicationError(ErrorCodes.CanNotLikeYourOwnMessage)
                }
                if (error.code === PermissionErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }

        const like = await this.likeQueryRepository.findByMessageAndUserId(messageId, requestUser.id)
        if (like == null) {
            try {
                const like = new LikeEntity({
                    id: -1,
                    messageId,
                    userId: requestUser.id,
                    count: 1,
                    updatedAt: new Date(),
                })
                await this.likeCommandRepository.add(like)

                message.likeCount += 1
                await this.messageCommandRepository.update(message)

                return true
            } catch (error) {
                throw new ApplicationError(ErrorCodes.InternalError)
            }
        } else {
            try {
                like.count += 1
                await this.likeCommandRepository.update(like)

                await this.permissionToCreateLike.hasThrow(requestUserId, messageId)
                message.likeCount += 1
                await this.messageCommandRepository.update(message)

                return true
            } catch (error) {
                if (error instanceof DomainError) {
                    if (error.code === DomainErrorCodes.InvalidCount) {
                        throw new ApplicationError(ErrorCodes.ReachedMaxCount)
                    }
                }
                throw new ApplicationError(ErrorCodes.InternalError)
            }
        }
    }
}
