import { MessageEntity } from "../../entity/Message"
import { MessageId } from "../../types"

export interface IMessageCommandRepository {
    add(message: MessageEntity): Promise<MessageId>
    update(message: MessageEntity): Promise<boolean>
    delete(message: MessageEntity): Promise<boolean>
}
