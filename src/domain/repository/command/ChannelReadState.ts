import { ChannelReadStateEntity } from "../../entity/ChannelReadState"
import { ChannelReadStateId } from "../../types"

export interface IChannelReadStateCommandRepository {
    add(state: ChannelReadStateEntity): Promise<ChannelReadStateId>
    delete(state: ChannelReadStateEntity): Promise<boolean>
    update(state: ChannelReadStateEntity): Promise<boolean>
    upsert(state: ChannelReadStateEntity): Promise<ChannelReadStateId>
}
