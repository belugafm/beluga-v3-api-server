import { MessageEntity } from "../../../entity/Message"
import { UserEntity } from "../../../entity/User"

export interface IHomeTimelineCommandRepository {
    add(message: MessageEntity, user: UserEntity): Promise<boolean>
}
