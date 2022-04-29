import { ChannelId, UserId } from "../../types"

import { ChannelReadStateEntity } from "../../entity/ChannelReadState"

export interface IChannelReadStateQueryRepository {
    find(channelId: ChannelId, userId: UserId): Promise<ChannelReadStateEntity | null>
}
