import { Message, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { assignChangeEventHandlerProperties, ChangeEventHandler } from "../ChangeEventHandler"
import { IMessageCommandRepository } from "../../../../domain/repository/command/Message"
import { MessageEntity } from "../../../../domain/entity/Message"
import { MessageId } from "../../../../domain/types"
import { prisma } from "../client"

export function hasChanged(a: Message, b: Message) {
    return !(
        a.channelId === b.channelId &&
        a.userId === b.userId &&
        a.text === b.text &&
        a.textStyle === b.textStyle &&
        a.createdAt?.getTime() === b.createdAt?.getTime() &&
        a.favoriteCount === b.favoriteCount &&
        a.likeCount === b.likeCount &&
        a.replyCount === b.replyCount &&
        a.threadId === b.threadId &&
        a.lastReplyMessageId === b.lastReplyMessageId &&
        a.lastReplyMessageCreatedAt === b.lastReplyMessageCreatedAt &&
        a.deleted === b.deleted
    )
}

export class MessageCommandRepository extends ChangeEventHandler implements IMessageCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super()
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(message: MessageEntity): Promise<MessageId> {
        if (message instanceof MessageEntity !== true) {
            throw new RepositoryError("`message` must be an instance of MessageEntity")
        }
        try {
            const result = await this._prisma.message.create({
                data: {
                    text: message.text,
                    textStyle: message.textStyle,
                    channelId: message.channelId,
                    userId: message.userId,
                    favoriteCount: message.favoriteCount,
                    likeCount: message.likeCount,
                    replyCount: message.replyCount,
                    threadId: message.threadId,
                    lastReplyMessageId: message.lastReplyMessageId,
                    lastReplyMessageCreatedAt: message.lastReplyMessageCreatedAt,
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
    async update(message: MessageEntity): Promise<boolean> {
        if (message instanceof MessageEntity !== true) {
            throw new RepositoryError("`message` must be an instance of MessageEntity")
        }
        try {
            const origMessage = await this._prisma.message.findUnique({
                where: {
                    id: message.id,
                },
            })
            if (origMessage == null) {
                throw new RepositoryError(`Message not found (id=${message.id})`)
            }
            const updatedMessage = await this._prisma.message.update({
                where: {
                    id: message.id,
                },
                data: {
                    text: message.text,
                    textStyle: message.textStyle,
                    channelId: message.channelId,
                    userId: message.userId,
                    favoriteCount: message.favoriteCount,
                    likeCount: message.likeCount,
                    replyCount: message.replyCount,
                    threadId: message.threadId,
                    deleted: message.deleted,
                    lastReplyMessageId: message.lastReplyMessageId,
                    lastReplyMessageCreatedAt: message.lastReplyMessageCreatedAt,
                },
            })
            if (hasChanged(origMessage, updatedMessage)) {
                await this.emitChanges(message.id)
                return true
            }
            return false
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(message: MessageEntity): Promise<boolean> {
        if (message instanceof MessageEntity !== true) {
            throw new RepositoryError("`message` must be an instance of MessageEntity")
        }
        try {
            await this._prisma.message.delete({
                where: {
                    id: message.id,
                },
            })
            await this.emitChanges(message.id)
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
assignChangeEventHandlerProperties(MessageCommandRepository)
