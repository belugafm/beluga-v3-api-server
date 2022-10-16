import { MessageId, UserId } from "../types"

import { DomainError } from "../DomainError"
import { IMessageQueryRepository } from "../repository/query/Message"
import { IUserQueryRepository } from "../repository/query/User"
import { TrustLevel } from "../../config/trust_level"
import { entityIdEquals } from "../entityIdEquals"

export const ErrorCodes = {
    CanNotLikeYourOwnMessage: "can_not_like_your_own_message",
    DoNotHavePermission: "do_not_have_permission",
} as const

export class CreateLikePermission {
    private userRepository: IUserQueryRepository
    private messageRepository: IMessageQueryRepository
    constructor(userRepository: IUserQueryRepository, channelRepository: IMessageQueryRepository) {
        this.userRepository = userRepository
        this.messageRepository = channelRepository
    }
    async hasThrow(requestUserId: UserId, messageId: MessageId) {
        const user = await this.userRepository.findById(requestUserId)
        if (user == null) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
        if (user.trustLevel < TrustLevel.AuthorizedUser) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
        const message = await this.messageRepository.findById(messageId)
        if (message == null) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
        if (entityIdEquals(message.userId, user.id) === true) {
            throw new DomainError(ErrorCodes.CanNotLikeYourOwnMessage)
        }
    }
}
