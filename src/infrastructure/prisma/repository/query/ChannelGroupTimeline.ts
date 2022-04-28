import { Parameters, SortOrder } from "../../../../domain/repository/query/ChannelGroupTimeline"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { IChannelGroupTimelineQueryRepository } from "../../../../domain/repository/query/ChannelGroupTimeline"
import { MessageId } from "../../../../domain/types"
import { PrismaClient } from "@prisma/client"
import { isInteger } from "../../../../domain/validation"
import { prisma } from "../client"

function getSortOrder(sortOrderString: typeof SortOrder[keyof typeof SortOrder]) {
    if (sortOrderString == SortOrder.Descending) {
        return "desc"
    }
    if (sortOrderString == SortOrder.Ascending) {
        return "asc"
    }
    throw new RepositoryError("invalid `sortOrder`")
}

export class ChannelGroupTimelineQueryRepository implements IChannelGroupTimelineQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async listMessageId(params: { channelGroupId: number } & Parameters): Promise<MessageId[]> {
        try {
            if (isInteger(params.channelGroupId) !== true) {
                throw new RepositoryError("`channelGroupId` must be a number")
            }
            if (params.sinceId) {
                if (isInteger(params.sinceId) !== true) {
                    throw new RepositoryError("`sinceId` must be a number")
                }
                const rows = await this._prisma.channelGroupTimeline.findMany({
                    where: {
                        channelGroupId: params.channelGroupId,
                        messageId: {
                            gt: params.sinceId,
                        },
                    },
                    orderBy: {
                        createdAt: getSortOrder(params.sortOrder),
                    },
                    take: params.limit,
                })
                return rows.map((row) => row.messageId)
            } else if (params.maxId) {
                if (isInteger(params.maxId) !== true) {
                    throw new RepositoryError("`maxId` must be a number")
                }
                const rows = await this._prisma.channelGroupTimeline.findMany({
                    where: {
                        channelGroupId: params.channelGroupId,
                        messageId: {
                            lt: params.maxId,
                        },
                    },
                    orderBy: {
                        createdAt: getSortOrder(params.sortOrder),
                    },
                    take: params.limit,
                })
                return rows.map((row) => row.messageId)
            } else {
                const rows = await this._prisma.channelGroupTimeline.findMany({
                    where: {
                        channelGroupId: params.channelGroupId,
                    },
                    orderBy: {
                        createdAt: getSortOrder(params.sortOrder),
                    },
                    take: params.limit,
                })
                return rows.map((row) => row.messageId)
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
