import { Channel, PrismaClient } from "@prisma/client"
import { ChannelGroupdId, UserId } from "../../../../domain/types"
import { IChannelQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/Channel"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"
import { isInteger, isString } from "../../../../domain/validation"

import { ChannelEntity } from "../../../../domain/entity/Channel"
import { prisma } from "../client"

export function toEntity(channel: Channel) {
    return new ChannelEntity({
        id: channel.id,
        name: channel.name,
        uniqueName: channel.uniqueName,
        createdBy: channel.createdBy,
        createdAt: channel.createdAt,
        parentChannelGroupId: channel.parentChannelGroupId,
        statusesCount: channel.statusesCount,
        statusString: channel.statusString,
    })
}

export class ChannelQueryRepository implements IChannelQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(userId: UserId): Promise<ChannelEntity | null> {
        try {
            if (isInteger(userId) !== true) {
                throw new RepositoryError("`userId` must be a number")
            }
            const channel = await this._prisma.channel.findUnique({
                where: {
                    id: userId,
                },
            })
            if (channel == null) {
                return null
            }
            return toEntity(channel)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByUniqueName(uniqueName: string): Promise<ChannelEntity | null> {
        try {
            if (isString(uniqueName) !== true) {
                throw new RepositoryError("`uniqueName` must be a string")
            }
            const channel = await this._prisma.channel.findUnique({
                where: {
                    uniqueName: uniqueName,
                },
            })
            if (channel == null) {
                return null
            }
            return toEntity(channel)
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
    ): Promise<ChannelEntity[]> {
        try {
            if (isInteger(userId) !== true) {
                throw new RepositoryError("`userId` must be a number")
            }
            const channels = await this._prisma.channel.findMany({
                where: {
                    createdBy: userId,
                },
            })
            const ret: ChannelEntity[] = []
            channels.forEach((channel) => {
                ret.push(toEntity(channel))
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
    async findByParentChannelGroupId(
        channelGroupId: ChannelGroupdId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<ChannelEntity[]> {
        try {
            if (isInteger(channelGroupId) !== true) {
                throw new RepositoryError("`channelGroupId` must be a number")
            }
            const channels = await this._prisma.channel.findMany({
                where: {
                    parentChannelGroupId: channelGroupId,
                },
            })
            const ret: ChannelEntity[] = []
            channels.forEach((channel) => {
                ret.push(toEntity(channel))
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
