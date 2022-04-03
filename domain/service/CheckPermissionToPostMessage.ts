import { ChannelId, UserId } from "../types"

import { DomainError } from "../DomainError"
import { IChannelQueryRepository } from "../repository/query/Channel"
import { IUserQueryRepository } from "../repository/query/User"

export const ErrorCodes = {
    DoNotHavePermission: "do_not_have_permission",
} as const

export class CheckPermissionToPostMessageService {
    private userRepository: IUserQueryRepository
    private channelRepository: IChannelQueryRepository
    constructor(userRepository: IUserQueryRepository, channelRepository: IChannelQueryRepository) {
        this.userRepository = userRepository
        this.channelRepository = channelRepository
    }
    async hasPermission(userId: UserId, channelId: ChannelId) {
        const user = await this.userRepository.findById(userId)
        if (user == null) {
            return false
        }
        const channel = await this.channelRepository.findById(channelId)
        if (channel == null) {
            return false
        }
        // TODO: 書き込み制御を実装する
        return true
    }
    async tryCheckIfUserHasPermission(userId: UserId, channelId: ChannelId) {
        if ((await this.hasPermission(userId, channelId)) == false) {
            throw new DomainError(ErrorCodes.DoNotHavePermission)
        }
    }
}
