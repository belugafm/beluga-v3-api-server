import { AttachmentEntity } from "../../entity/Attachment"
import { AttachmentId, MessageId } from "../../types"

export interface IAttachmentQueryRepository {
    findById(attachmentId: AttachmentId): Promise<AttachmentEntity | null>
    findByMessageId(messageId: MessageId): Promise<AttachmentEntity[]>
}
