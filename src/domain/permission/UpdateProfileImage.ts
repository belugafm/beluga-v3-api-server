import { DomainError } from "../DomainError"
import { IUserQueryRepository } from "../repository/query/User"
import { TrustLevel } from "../../config/trust_level"
import { UserId } from "../types"

export const ErrorCodes = {
    DoNotHavePermission: "do_not_have_permission",
} as const

export class UpdateProfileImagePermission {
    private userRepository: IUserQueryRepository
    constructor(userRepository: IUserQueryRepository) {
        this.userRepository = userRepository
    }
    async hasPermission(userIdToChange: UserId, authUserId: UserId) {
        const authUser = await this.userRepository.findById(authUserId)
        if (authUser == null) {
            return false
        }
        if (authUser.trustLevel < TrustLevel.AuthorizedUser) {
            return false
        }
        const userToChange = await this.userRepository.findById(userIdToChange)
        if (userToChange == null) {
            return false
        }
        if (userToChange.trustLevel < TrustLevel.AuthorizedUser) {
            return false
        }
        if (userToChange.id == authUser.id) {
            return true
        }
        if (userToChange.bot && userToChange.botOwnerId == authUser.id) {
            return true
        }
        return false
    }
    async hasThrow(userIdToChange: UserId, authUserId: UserId) {
        if ((await this.hasPermission(userIdToChange, authUserId)) == false) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
    }
}
