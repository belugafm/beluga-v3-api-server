import { MessageId, UserId } from "../../domain/types"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IMessageCommandRepository } from "../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../domain/repository/query/Message"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { IFavoriteQueryRepository } from "../../domain/repository/query/Favorite"
import { IFavoriteCommandRepository } from "../../domain/repository/command/Favorite"
import { CreateFavoritePermission, ErrorCodes as PermissionErrorCodes } from "../../domain/permission/CreateFavorite"
import { FavoriteEntity } from "../../domain/entity/Favorite"

export const ErrorCodes = {
    InternalError: "internal_error",
    RequestUserNotFound: "request_user_not_found",
    MessageNotFound: "message_not_found",
    AlreadyFavorited: "already_favorited",
    ...PermissionErrorCodes,
} as const

export class CreateFavoriteApplication {
    private messageCommandRepository: IMessageCommandRepository
    private messageQueryRepository: IMessageQueryRepository
    private userQueryRepository: IUserQueryRepository
    private favoriteQueryRepository: IFavoriteQueryRepository
    private favoriteCommandRepository: IFavoriteCommandRepository
    private permissionToCreateFavorite: CreateFavoritePermission
    constructor(
        userQueryRepository: IUserQueryRepository,
        messageQueryRepository: IMessageQueryRepository,
        messageCommandRepository: IMessageCommandRepository,
        favoriteQueryRepository: IFavoriteQueryRepository,
        favoriteCommandRepository: IFavoriteCommandRepository
    ) {
        this.userQueryRepository = userQueryRepository
        this.messageQueryRepository = messageQueryRepository
        this.messageCommandRepository = messageCommandRepository
        this.favoriteQueryRepository = favoriteQueryRepository
        this.favoriteCommandRepository = favoriteCommandRepository
        this.permissionToCreateFavorite = new CreateFavoritePermission(userQueryRepository, messageQueryRepository)
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
            await this.permissionToCreateFavorite.hasThrow(requestUserId, messageId)
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === PermissionErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
        const favorite = await this.favoriteQueryRepository.findByMessageAndUserId(messageId, requestUser.id)
        if (favorite != null) {
            throw new ApplicationError(ErrorCodes.AlreadyFavorited)
        }
        try {
            const favorite = new FavoriteEntity({
                id: -1,
                messageId,
                userId: requestUser.id,
                createdAt: new Date(),
            })
            await this.favoriteCommandRepository.add(favorite)

            message.favoriteCount += 1
            await this.messageCommandRepository.update(message)

            return true
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
