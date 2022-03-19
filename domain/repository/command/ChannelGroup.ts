import { ChannelGroupEntity } from "../../entity/ChannelGroup"
import { ChannelGroupdId } from "../../types"

export interface IChannelGroupCommandRepository {
    add(channel: ChannelGroupEntity): Promise<ChannelGroupdId>
    delete(channel: ChannelGroupEntity): Promise<boolean>
    update(channel: ChannelGroupEntity): Promise<boolean>
}
