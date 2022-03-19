import { ChannelEntity } from "../../entity/Channel"
import { ChannelId } from "../../types"

export interface IChannelCommandRepository {
    add(channel: ChannelEntity): Promise<ChannelId>
    delete(channel: ChannelEntity): Promise<boolean>
    update(channel: ChannelEntity): Promise<boolean>
}
