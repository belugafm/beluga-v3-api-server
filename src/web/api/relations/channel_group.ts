import { ChannelGroupJsonObjectT } from "../../../domain/types"
import { ChannelGroupQueryRepository, UserQueryRepository } from "../../repositories"

export const includeChannelGroupRelations = async (
    channelGroupObj: ChannelGroupJsonObjectT
): Promise<ChannelGroupJsonObjectT> => {
    const userRepository = new UserQueryRepository()
    if (channelGroupObj.parent_id != null) {
        const parent = await new ChannelGroupQueryRepository().findById(channelGroupObj.parent_id)
        if (parent) {
            channelGroupObj.parent = parent.toJsonObject()
        }
    }
    const user = await userRepository.findById(channelGroupObj.user_id)
    if (user) {
        channelGroupObj.user = user.toJsonObject()
    }
    return channelGroupObj
}
