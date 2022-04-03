import { Message, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { IMessageCommandRepository } from "../../../../domain/repository/command/Message"
import { MessageEntity } from "../../../../domain/entity/Message"
import { MessageId } from "../../../../domain/types"
import { prisma } from "../client"

export function has_changed(a: Message, b: Message) {
    return !(
        a.channelId === b.channelId &&
        a.userId === b.userId &&
        a.text === b.text &&
        a.createdAt?.getTime() === b.createdAt?.getTime() &&
        a.favoriteCount === b.favoriteCount &&
        a.likeCount === b.likeCount &&
        a.replyCount === b.replyCount &&
        a.threadId === b.threadId
    )
}

export class MessageCommandRepository extends ChangeEventHandler implements IMessageCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super(MessageCommandRepository)
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
                    channelId: message.channelId,
                    userId: message.userId,
                    favoriteCount: message.favoriteCount,
                    likeCount: message.likeCount,
                    replyCount: message.replyCount,
                    threadId: message.threadId,
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
            const updatedChannel = await this._prisma.message.update({
                where: {
                    id: message.id,
                },
                data: {
                    text: message.text,
                    channelId: message.channelId,
                    userId: message.userId,
                    favoriteCount: message.favoriteCount,
                    likeCount: message.likeCount,
                    replyCount: message.replyCount,
                    threadId: message.threadId,
                },
            })
            if (has_changed(origMessage, updatedChannel)) {
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
