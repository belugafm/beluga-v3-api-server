import { FileEntity } from "../../../domain/entity/File"
import { UserEntity } from "../../../domain/entity/User"
import { MessageJsonObjectT } from "../../../domain/types"
import {
    FavoriteQueryRepository,
    UserQueryRepository,
    ChannelQueryRepository,
    FileQueryRepository,
    AttachmentQueryRepository,
} from "../../repositories"

const extractMediaEntitiesForUrl = (text: string, file: FileEntity) => {
    const url = file.getPublicUrl()
    const fileObj = file.toJsonObject()
    let ret: MessageJsonObjectT["entities"]["files"] = []
    let cursor = text.indexOf(url)
    while (cursor != -1) {
        ret.push({
            file_id: file.id,
            file: fileObj,
            indices: [cursor, cursor + url.length - 1],
        })
        cursor = text.indexOf(url, cursor + url.length)
    }
    return ret
}

export const includeMessageRelations = async (
    messageObj: MessageJsonObjectT,
    authUser: UserEntity | null
): Promise<MessageJsonObjectT> => {
    const userRepository = new UserQueryRepository()
    const fileRepository = new FileQueryRepository()
    const attachmentRepository = new AttachmentQueryRepository()
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
    if (messageObj.text && messageObj.text?.indexOf("http") != -1) {
        const attachments = await attachmentRepository.findByMessageId(messageObj.id)
        let entities: MessageJsonObjectT["entities"]["files"] = []
        for (const attachment of attachments) {
            const file = await fileRepository.findById(attachment.fileId)
            if (file) {
                const entitiesForUrl = extractMediaEntitiesForUrl(messageObj.text, file)
                entities = entities.concat(entitiesForUrl)
            }
        }
        messageObj.entities.files = entities
    }
    return messageObj
}
