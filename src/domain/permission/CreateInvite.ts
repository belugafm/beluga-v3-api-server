import { MessageId, UserId } from "../types"

import { DomainError } from "../DomainError"
import { IUserQueryRepository } from "../repository/query/User"
import { TrustLevel } from "../../config/trust_level"

export const ErrorCodes = {
    DoNotHavePermission: "do_not_have_permission",
} as const

export class CreateInvitePermission {
    private userRepository: IUserQueryRepository
    constructor(userRepository: IUserQueryRepository) {
        this.userRepository = userRepository
    }
    async hasThrow(requestUserId: UserId) {
        const user = await this.userRepository.findById(requestUserId)
        if (user == null) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
        if (user.trustLevel < TrustLevel.AuthorizedUser) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
    }
}
