import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { MessageEntity } from "../../../../domain/entity/Message"
import { PrismaClient } from "@prisma/client"
import { isInteger } from "../../../../domain/validation"
import { prisma } from "../client"
import { toEntity } from "./Message"
import {
    IThreadTimelineQueryRepository,
    SortOrder,
    Parameters,
} from "../../../../domain/repository/query/ThreadTimeline"

function getSortOrder(sortOrderString: typeof SortOrder[keyof typeof SortOrder]) {
    if (sortOrderString == SortOrder.Descending) {
        return "desc"
    }
    if (sortOrderString == SortOrder.Ascending) {
        return "asc"
    }
    throw new RepositoryError("invalid `sortOrder`")
}

export class ThreadTimelineQueryRepository implements IThreadTimelineQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async listMessage(params: { messageId: number } & Parameters): Promise<MessageEntity[]> {
        try {
            if (isInteger(params.messageId) !== true) {
                throw new RepositoryError("`messageId` must be a number")
            }
            if (params.sinceId) {
                if (isInteger(params.sinceId) !== true) {
                    throw new RepositoryError("`sinceId` must be a number")
                }
                const messages = await this._prisma.message.findMany({
                    where: {
                        threadId: params.messageId,
                        deleted: false,
                        id: {
                            gt: params.sinceId,
                        },
                    },
                    orderBy: {
                        createdAt: getSortOrder(params.sortOrder),
                    },
                    take: params.limit,
                })
                return messages.map((message) => toEntity(message))
            } else if (params.maxId) {
                if (isInteger(params.maxId) !== true) {
                    throw new RepositoryError("`maxId` must be a number")
                }
                const messages = await this._prisma.message.findMany({
                    where: {
                        threadId: params.messageId,
                        deleted: false,
                        id: {
                            lt: params.maxId,
                        },
                    },
                    orderBy: {
                        createdAt: getSortOrder(params.sortOrder),
                    },
                    take: params.limit,
                })
                return messages.map((message) => toEntity(message))
            } else {
                const messages = await this._prisma.message.findMany({
                    where: {
                        threadId: params.messageId,
                        deleted: false,
                    },
                    orderBy: {
                        createdAt: getSortOrder(params.sortOrder),
                    },
                    take: params.limit,
                })
                return messages.map((message) => toEntity(message))
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
