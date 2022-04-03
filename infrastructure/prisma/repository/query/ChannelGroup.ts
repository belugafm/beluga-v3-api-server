import { ChannelGroup, PrismaClient } from "@prisma/client"
import { ChannelGroupdId, UserId } from "../../../../domain/types"
import { IChannelGroupQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/ChannelGroup"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"
import { isInteger, isString } from "../../../../domain/validation"

import { ChannelEntity } from "../../../../domain/entity/Channel"
import { ChannelGroupEntity } from "../../../../domain/entity/ChannelGroup"
import { toEntity as channelToEntity } from "./Channel"
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
    async findById(id: UserId): Promise<ChannelGroupEntity | null> {
        try {
            if (isInteger(id) !== true) {
                throw new RepositoryError("`id` must be a number")
            }
            const channelGroup = await this._prisma.channelGroup.findUnique({
                where: {
                    id,
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
    async listChannels(
        id: ChannelGroupdId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelEntity[]> {
        try {
            if (isInteger(id) !== true) {
                throw new RepositoryError("`id` must be a number")
            }
            const channels = await this._prisma.channel.findMany({
                where: {
                    parentChannelGroupId: id,
                },
            })
            const ret: ChannelEntity[] = []
            channels.forEach((channelGroup) => {
                ret.push(channelToEntity(channelGroup))
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
    async listChannelGroups(
        id: ChannelGroupdId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelGroupEntity[]> {
        try {
            if (isInteger(id) !== true) {
                throw new RepositoryError("`id` must be a number")
            }
            const channels = await this._prisma.channelGroup.findMany({
                where: {
                    parentId: id,
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
