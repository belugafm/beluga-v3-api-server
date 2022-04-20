import { MessageId, UserId } from "../types"

import { DomainError } from "../DomainError"
import { IMessageQueryRepository } from "../repository/query/Message"
import { IUserQueryRepository } from "../repository/query/User"
import { TrustLevel } from "../../config/trust_level"
import { entityIdEquals } from "../entityIdEquals"

export const ErrorCodes = {
    DoNotHavePermission: "do_not_have_permission",
} as const

export class DeleteMessagePermission {
    private userRepository: IUserQueryRepository
    private messageRepository: IMessageQueryRepository
    constructor(userRepository: IUserQueryRepository, channelRepository: IMessageQueryRepository) {
        this.userRepository = userRepository
        this.messageRepository = channelRepository
    }
    async hasPermission(userId: UserId, messageId: MessageId) {
        const user = await this.userRepository.findById(userId)
        if (user == null) {
            return false
        }
        if (user.trustLevel < TrustLevel.AuthorizedUser) {
            return false
        }
        const message = await this.messageRepository.findById(messageId)
        if (message == null) {
            return false
        }
        if (entityIdEquals(message.userId, user.id) == false) {
            return false
        }
        return true
    }
    async hasThrow(requestUserId: UserId, messageId: MessageId) {
        if ((await this.hasPermission(requestUserId, messageId)) == false) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
    }
}
