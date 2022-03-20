import { ChannelGroup, PrismaClient } from "@prisma/client"
import {
    IChannelGroupQueryRepository,
    SortBy,
    SortOrder,
} from "../../../../domain/repository/query/ChannelGroup"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"
import { isNumber, isString } from "../../../../domain/validation"

import { ChannelGroupEntity } from "../../../../domain/entity/ChannelGroup"
import { UserId } from "../../../../domain/types"
import { prisma } from "../client"

function toEntity(channelGroup: ChannelGroup) {
    return new ChannelGroupEntity({
        id: channelGroup.id,
        name: channelGroup.name,
        uniqueName: channelGroup.uniqueName,
        createdBy: channelGroup.createdBy,
        createdAt: channelGroup.createdAt,
        parentId: channelGroup.parentId,
        level: channelGroup.level,
        statusesCount: channelGroup.statusesCount,
    })
}
export class ChannelGroupQueryRepository implements IChannelGroupQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(userId: UserId): Promise<ChannelGroupEntity | null> {
        try {
            if (isNumber(userId) !== true) {
                throw new RepositoryError("`userId` must be a number")
            }
            const channelGroup = await this._prisma.channelGroup.findUnique({
                where: {
                    id: userId,
                },
            })
            if (channelGroup == null) {
                return null
            }
            return toEntity(channelGroup)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByUniqueName(uniqueName: string): Promise<ChannelGroupEntity | null> {
        try {
            if (isString(uniqueName) !== true) {
                throw new RepositoryError("`uniqueName` must be a string")
            }
            const channelGroup = await this._prisma.channelGroup.findUnique({
                where: {
                    uniqueName: uniqueName,
                },
            })
            if (channelGroup == null) {
                return null
            }
            return toEntity(channelGroup)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelGroupEntity[]> {
        try {
            if (isNumber(userId) !== true) {
                throw new RepositoryError("`userId` must be a number")
            }
            const channels = await this._prisma.channelGroup.findMany({
                where: {
                    createdBy: userId,
                },
            })
            const ret: ChannelGroupEntity[] = []
            channels.forEach((channelGroup) => {
                ret.push(toEntity(channelGroup))
            })
            return ret
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
