import { AttachmentEntity } from "../../entity/Attachment"
import { AttachmentId, MessageId } from "../../types"

export interface IAttachmentCommandRepository {
    add(attachment: AttachmentEntity): Promise<AttachmentId>
    delete(attachment: AttachmentEntity): Promise<boolean>
    deleteByMessageId(messageId: MessageId): Promise<boolean>
}
