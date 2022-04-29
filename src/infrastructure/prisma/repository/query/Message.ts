import { Message, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { IMessageQueryRepository } from "../../../../domain/repository/query/Message"
import { MessageEntity } from "../../../../domain/entity/Message"
import { MessageId } from "../../../../domain/types"
import { isInteger } from "../../../../domain/validation"
import { prisma } from "../client"

export function toEntity(message: Message) {
    return new MessageEntity({
        id: message.id,
        channelId: message.channelId,
        userId: message.userId,
        text: message.text,
        createdAt: message.createdAt,
        favoriteCount: message.favoriteCount,
        likeCount: message.likeCount,
        replyCount: message.replyCount,
        threadId: message.threadId,
    })
}

export class MessageQueryRepository implements IMessageQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(id: MessageId): Promise<MessageEntity | null> {
        try {
            if (isInteger(id) !== true) {
                throw new RepositoryError("`id` must be a number")
            }
            const message = await this._prisma.message.findUnique({
                where: {
                    id: id,
                },
            })
            if (message == null) {
                return null
            }
            return toEntity(message)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findLatestForUser(userId: number): Promise<MessageEntity | null> {
        try {
            if (isInteger(userId) !== true) {
                throw new RepositoryError("`userId` must be a number")
            }
            const message = await this._prisma.message.findFirst({
                where: {
                    userId,
                    threadId: null,
                    deleted: false,
                },
                orderBy: {
                    createdAt: "desc",
                },
            })
            if (message == null) {
                return null
            }
            return toEntity(message)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findLatestForChannel(channelId: number): Promise<MessageEntity | null> {
        try {
            if (isInteger(channelId) !== true) {
                throw new RepositoryError("`channelId` must be a number")
            }
            const message = await this._prisma.message.findFirst({
                where: {
                    channelId,
                    threadId: null,
                    deleted: false,
                },
                orderBy: {
                    createdAt: "desc",
                },
            })
            if (message == null) {
                return null
            }
            return toEntity(message)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
