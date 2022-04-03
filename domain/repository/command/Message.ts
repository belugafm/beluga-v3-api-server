import { MessageEntity } from "../../entity/Message"
import { MessageId } from "../../types"

export interface IMessageCommandRepository {
    add(credential: MessageEntity): Promise<MessageId>
    update(credential: MessageEntity): Promise<boolean>
    delete(credential: MessageEntity): Promise<boolean>
}
