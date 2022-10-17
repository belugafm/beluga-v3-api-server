import { UserEntity } from "../../../domain/entity/User"
import { MessageJsonObjectT } from "../../../domain/types"
import { FavoriteQueryRepository, UserQueryRepository, ChannelQueryRepository } from "../../repositories"

export const includeMessageRelations = async (
    messageObj: MessageJsonObjectT,
    authUser: UserEntity | null
): Promise<MessageJsonObjectT> => {
    const userRepository = new UserQueryRepository()
    if (messageObj.favorite_count > 0) {
        const favorites = await new FavoriteQueryRepository().findAllByMessageId(
            messageObj.id,
            "created_at",
            "ascending"
        )
        const favoritedUserObjs = []
        for (const favorite of favorites) {
            const user = await userRepository.findById(favorite.userId)
            if (user) {
                favoritedUserObjs.push(user.toJsonObject())
            }
        }
        messageObj.entities.favorited_users = favoritedUserObjs
    }
    if (authUser) {
        const favorite = await new FavoriteQueryRepository().findByMessageAndUserId(messageObj.id, authUser.id)
        messageObj.favorited = favorite != null
    }
    const user = await userRepository.findById(messageObj.user_id)
    if (user) {
        messageObj.user = user.toJsonObject()
    }
    const channel = await new ChannelQueryRepository().findById(messageObj.channel_id)
    if (channel) {
        messageObj.channel = channel.toJsonObject()
    }
    return messageObj
}
