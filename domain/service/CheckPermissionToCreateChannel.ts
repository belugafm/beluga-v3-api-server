import { DomainError } from "../DomainError"
import { IUserQueryRepository } from "../repository/query/User"
import { TrustLevel } from "../../config/trust_level"
import { UserId } from "../types"

export const ErrorCodes = {
    DoNotHavePermission: "do_not_have_permission",
} as const

export class CheckPermissionToCreateChannelService {
    private userRepository: IUserQueryRepository
    constructor(userRepository: IUserQueryRepository) {
        this.userRepository = userRepository
    }
    async hasPermission(userId: UserId) {
        const user = await this.userRepository.findById(userId)
        if (user == null) {
            return false
        }
        if (user.trustLevel < TrustLevel.AuthorizedUser) {
            return false
        }
        return true
    }
    async tryCheckIfUserHasPermission(userId: UserId) {
        if ((await this.hasPermission(userId)) == false) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
    }
}
