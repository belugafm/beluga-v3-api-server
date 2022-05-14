import { ChannelGroup, PrismaClient } from "@prisma/client"
import { IChannelGroupQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/ChannelGroup"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"
import { isInteger, isString } from "../../../../domain/validation"

import { ChannelEntity } from "../../../../domain/entity/Channel"
import { ChannelGroupEntity } from "../../../../domain/entity/ChannelGroup"
import { ChannelGroupdId } from "../../../../domain/types"
import { toEntity as channelToEntity } from "./Channel"
import { prisma } from "../client"

function toEntity(channelGroup: ChannelGroup) {
    return new ChannelGroupEntity({
        id: channelGroup.id,
        name: channelGroup.name,
        uniqueName: channelGroup.uniqueName,
        createdBy: channelGroup.createdBy,
        createdAt: channelGroup.createdAt,
        description: channelGroup.description,
        parentId: channelGroup.parentId,
        level: channelGroup.level,
        messageCount: channelGroup.messageCount,
        imageUrl: channelGroup.imageUrl,
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
    async findById(id: ChannelGroupdId): Promise<ChannelGroupEntity | null> {
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
            return channels.map((channel) => channelToEntity(channel))
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
            const channelGroups = await this._prisma.channelGroup.findMany({
                where: {
                    parentId: id,
                },
            })
            return channelGroups.map((channelGroup) => toEntity(channelGroup))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
