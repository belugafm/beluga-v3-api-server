import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { PrismaClient } from "@prisma/client"
import { prisma } from "../client"
import { IAttachmentCommandRepository } from "../../../../domain/repository/command/Attachment"
import { AttachmentEntity } from "../../../../domain/entity/Attachment"
import { AttachmentId, MessageId } from "../../../../domain/types"
import { MessageIdValidator } from "../../../../domain/validation"

export class AttachmentCommandRepository implements IAttachmentCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(attachment: AttachmentEntity): Promise<AttachmentId> {
        if (attachment instanceof AttachmentEntity !== true) {
            throw new RepositoryError("`attachment` must be an instance of AttachmentEntity")
        }
        try {
            const result = await this._prisma.attachment.create({
                data: {
                    messageId: attachment.messageId,
                    fileId: attachment.fileId,
                },
            })
            return result.id
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(attachment: AttachmentEntity): Promise<boolean> {
        if (attachment instanceof AttachmentEntity !== true) {
            throw new RepositoryError("`attachment` must be an instance of AttachmentEntity")
        }
        try {
            await this._prisma.attachment.delete({
                where: {
                    id: attachment.id,
                },
            })
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async deleteByMessageId(messageId: MessageId): Promise<boolean> {
        if (MessageIdValidator().ok(messageId) !== true) {
            throw new RepositoryError("`messageId` must be MessageId")
        }
        try {
            await this._prisma.attachment.deleteMany({
                where: {
                    messageId: messageId,
                },
            })
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
