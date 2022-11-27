import { DomainError } from "../DomainError"
import { IUserQueryRepository } from "../repository/query/User"
import { TrustLevel } from "../../config/trust_level"
import { ChannelGroupdId, UserId } from "../types"
import { IChannelGroupQueryRepository } from "../repository/query/ChannelGroup"

export const ErrorCodes = {
    DoNotHavePermission: "do_not_have_permission",
} as const

export class CreateChannelPermission {
    private userRepository: IUserQueryRepository
    private channelGroupRepository: IChannelGroupQueryRepository
    constructor(userRepository: IUserQueryRepository, channelGroupRepository: IChannelGroupQueryRepository) {
        this.userRepository = userRepository
        this.channelGroupRepository = channelGroupRepository
    }
    async hasPermission(userId: UserId, channelGroupId: ChannelGroupdId) {
        const user = await this.userRepository.findById(userId)
        if (user == null) {
            return false
        }
        const channelGroup = await this.channelGroupRepository.findById(channelGroupId)
        if (channelGroup == null) {
            return false
        }
        // @ts-ignore
        if (user.trustLevel < TrustLevel[channelGroup.minimumTrustRank]) {
            return false
        }
        return true
    }
    async hasThrow(userId: UserId, channelGroupId: ChannelGroupdId) {
        if ((await this.hasPermission(userId, channelGroupId)) == false) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
    }
}
