import { ChannelGroupEntity } from "../../../entity/ChannelGroup"
import { MessageEntity } from "../../../entity/Message"

export interface IChannelGroupTimelineCommandRepository {
    add(message: MessageEntity, channelGroup: ChannelGroupEntity): Promise<boolean>
}
