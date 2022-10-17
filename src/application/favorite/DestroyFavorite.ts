import { MessageId, UserId } from "../../domain/types"

import { ApplicationError } from "../ApplicationError"
import { IMessageCommandRepository } from "../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../domain/repository/query/Message"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { IFavoriteQueryRepository } from "../../domain/repository/query/Favorite"
import { IFavoriteCommandRepository } from "../../domain/repository/command/Favorite"

export const ErrorCodes = {
    InternalError: "internal_error",
    RequestUserNotFound: "request_user_not_found",
    MessageNotFound: "message_not_found",
    NotFavorited: "not_favorited",
} as const

export class DestroyFavoriteApplication {
    private messageCommandRepository: IMessageCommandRepository
    private messageQueryRepository: IMessageQueryRepository
    private userQueryRepository: IUserQueryRepository
    private favoriteQueryRepository: IFavoriteQueryRepository
    private favoriteCommandRepository: IFavoriteCommandRepository
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
        const favorite = await this.favoriteQueryRepository.findByMessageAndUserId(messageId, requestUser.id)
        if (favorite == null) {
            throw new ApplicationError(ErrorCodes.NotFavorited)
        }
        try {
            await this.favoriteCommandRepository.delete(favorite)

            message.favoriteCount -= 1
            await this.messageCommandRepository.update(message)

            return true
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
