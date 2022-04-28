import { DomainError } from "../DomainError"
import { IMessageQueryRepository } from "../repository/query/Message"
import { IUserQueryRepository } from "../repository/query/User"
import { TrustLevel } from "../../config/trust_level"
import { UserId } from "../types"
import config from "../../config/app"

export const ErrorCodes = {
    RateLimitExceeded: "rate_limit_exceeded",
} as const

export class CheckRateLimitForPostingMessageService {
    private userRepository: IUserQueryRepository
    private messageRepository: IMessageQueryRepository
    constructor(userRepository: IUserQueryRepository, messageRepository: IMessageQueryRepository) {
        this.userRepository = userRepository
        this.messageRepository = messageRepository
    }
    async checkIfUserExceedsRateLimit(userId: UserId) {
        const user = await this.userRepository.findById(userId)
        if (user == null) {
            return false
        }
        if (user.trustLevel >= TrustLevel.AuthorizedUser) {
            return false
        }
        const lastMessage = await this.messageRepository.findLastForUser(userId)
        if (lastMessage == null) {
            return false
        }
        const elapsedMilliSeconds = new Date().getTime() - lastMessage.createdAt.getTime()
        if (elapsedMilliSeconds >= config.message.wait_until) {
            return false
        }
        return true
    }
    async hasThrow(userId: UserId) {
        if ((await this.checkIfUserExceedsRateLimit(userId)) == true) {
            throw new DomainError(ErrorCodes.RateLimitExceeded)
        }
    }
}
