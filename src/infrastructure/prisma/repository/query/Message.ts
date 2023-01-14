import { Message, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { IMessageQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/Message"
import { MessageEntity } from "../../../../domain/entity/Message"
import { MessageId } from "../../../../domain/types"
import {
    ChannelIdValidator,
    isDate,
    isInteger,
    isString,
    MessageIdValidator,
    UserIdValidator,
} from "../../../../domain/validation"
import { prisma } from "../client"

export function toEntity(message: Message) {
    return new MessageEntity({
        id: message.id,
        channelId: message.channelId,
        userId: message.userId,
        text: message.text,
        textStyle: message.textStyle,
        createdAt: message.createdAt,
        favoriteCount: message.favoriteCount,
        likeCount: message.likeCount,
        replyCount: message.replyCount,
        threadId: message.threadId,
        lastReplyMessageId: message.lastReplyMessageId,
        lastReplyMessageCreatedAt: message.lastReplyMessageCreatedAt,
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
    async search(params: {
        text: string
        channelId?: number
        userId?: number
        sinceId?: number
        maxId?: number
        sinceDate?: number
        untilDate?: number
        limit?: number
        sortBy?: typeof SortBy[keyof typeof SortBy]
        sortOrder?: typeof SortOrder[keyof typeof SortOrder]
    }): Promise<MessageEntity[]> {
        try {
            const where: any = {
                text: { search: params.text },
                deleted: false,
            }
            if (MessageIdValidator().ok(params.sinceId)) {
                where["messageId"] = {
                    gt: params.sinceId,
                }
            } else if (MessageIdValidator().ok(params.maxId)) {
                where["messageId"] = {
                    lt: params.sinceId,
                }
            }
            if (isDate(params.sinceDate)) {
                where["createdAt"] = {
                    gt: params.sinceDate,
                }
            } else if (isDate(params.untilDate)) {
                where["createdAt"] = {
                    lt: params.untilDate,
                }
            }
            if (ChannelIdValidator().ok(params.channelId)) {
                where["channelId"] = params.channelId
            }
            if (UserIdValidator().ok(params.userId)) {
                where["userId"] = params.userId
            }
            const orderBy: any = {}
            if (isString(params.sortBy)) {
                if (params.sortOrder == SortOrder.Ascending) {
                    orderBy[params.sortBy] = "asc"
                } else if (params.sortOrder == SortOrder.Descending) {
                    orderBy[params.sortBy] = "desc"
                }
            }
            const messages = await this._prisma.message.findMany({
                where,
                orderBy,
                take: isInteger(params.limit) ? Math.min(200, params.limit) : 30,
            })
            return messages.map((message) => {
                return toEntity(message)
            })
        } catch (error) {
            console.error(error)
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
