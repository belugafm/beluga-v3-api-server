import { Attachment, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { AttachmentEntity } from "../../../../domain/entity/Attachment"
import { prisma } from "../client"
import { IAttachmentQueryRepository } from "../../../../domain/repository/query/Attachment"
import { isInteger } from "../../../../domain/validation"

function toEntity(attachment: Attachment) {
    return new AttachmentEntity({
        id: attachment.id,
        messageId: attachment.messageId,
        fileId: attachment.fileId,
    })
}
export class AttachmentQueryRepository implements IAttachmentQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(attachmentId: number): Promise<AttachmentEntity | null> {
        try {
            if (isInteger(attachmentId) !== true) {
                throw new RepositoryError("`appId` must be a number")
            }
            const app = await this._prisma.attachment.findUnique({
                where: {
                    id: attachmentId,
                },
            })
            if (app == null) {
                return null
            }
            return toEntity(app)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByMessageId(messageId: number): Promise<AttachmentEntity[]> {
        try {
            const attachments = await this._prisma.attachment.findMany({
                where: {
                    messageId,
                },
            })
            return attachments.map((app) => toEntity(app))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
