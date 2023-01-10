import { AttachmentId, FileId, MessageId } from "../types"
import { IsAttachmentId, IsFileId, IsMessageId } from "../validation/decorators"

import { Entity } from "./Entity"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidMessageId: "invalid_message_id",
    InvalidFileId: "invalid_file_id",
} as const

export class AttachmentEntity extends Entity {
    @IsAttachmentId({ errorCode: ErrorCodes.InvalidId })
    id: AttachmentId

    @IsMessageId({ errorCode: ErrorCodes.InvalidMessageId })
    messageId: MessageId

    @IsFileId({ errorCode: ErrorCodes.InvalidFileId })
    fileId: FileId

    constructor(params: {
        id: AttachmentEntity["id"]
        messageId: AttachmentEntity["messageId"]
        fileId: AttachmentEntity["fileId"]
    }) {
        super()
        this.id = params.id
        this.messageId = params.messageId
        this.fileId = params.fileId
    }
}
