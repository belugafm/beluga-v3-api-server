import { ChannelGroup, PrismaClient } from "@prisma/client"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { ChannelGroupEntity } from "../../../../domain/entity/ChannelGroup"
import { ChannelGroupdId } from "../../../../domain/types"
import { IChannelGroupCommandRepository } from "../../../../domain/repository/command/ChannelGroup"
import { prisma } from "../client"

export function has_changed(a: ChannelGroup, b: ChannelGroup) {
    return !(
        a.name === b.name &&
        a.uniqueName === b.uniqueName &&
        a.parentId === b.parentId &&
        a.level === b.level &&
        a.createdAt?.getTime() === b.createdAt?.getTime() &&
        a.createdBy === b.createdBy &&
        a.statusesCount === b.statusesCount
    )
}

export class ChannelGroupCommandRepository
    extends ChangeEventHandler
    implements IChannelGroupCommandRepository
{
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super(ChannelGroupCommandRepository)
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(channelGroup: ChannelGroupEntity): Promise<ChannelGroupdId> {
        if (channelGroup instanceof ChannelGroupEntity !== true) {
            throw new RepositoryError("`channelGroup` must be an instance of ChannelGroupEntity")
        }
        try {
            const result = await this._prisma.channelGroup.create({
                data: {
                    name: channelGroup.name,
                    uniqueName: channelGroup.uniqueName,
                    parentId: channelGroup.parentId,
                    level: channelGroup.level,
                    createdAt: channelGroup.createdAt,
                    createdBy: channelGroup.createdBy,
                    statusesCount: channelGroup.statusesCount,
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
    async update(channelGroup: ChannelGroupEntity): Promise<boolean> {
        if (channelGroup instanceof ChannelGroupEntity !== true) {
            throw new RepositoryError("`channelGroup` must be an instance of ChannelGroupEntity")
        }
        try {
            const origChannelGroup = await this._prisma.channelGroup.findUnique({
                where: {
                    id: channelGroup.id,
                },
            })
            if (origChannelGroup == null) {
                throw new RepositoryError(
                    `'channelGroup' not found (id=${channelGroup.id}, uniqueName='${channelGroup.uniqueName}')`
                )
            }
            const updatedChannelGroup = await this._prisma.channelGroup.update({
                where: {
                    id: channelGroup.id,
                },
                data: {
                    name: channelGroup.name,
                    parentId: channelGroup.parentId,
                    level: channelGroup.level,
                    createdAt: channelGroup.createdAt,
                    createdBy: channelGroup.createdBy,
                    statusesCount: channelGroup.statusesCount,
                },
            })
            if (has_changed(origChannelGroup, updatedChannelGroup)) {
                await this.emitChanges(channelGroup.id)
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
    async delete(channelGroup: ChannelGroupEntity): Promise<boolean> {
        if (channelGroup instanceof ChannelGroupEntity !== true) {
            throw new RepositoryError("`channelGroup` must be an instance of ChannelGroupEntity")
        }
        try {
            await this._prisma.channelGroup.delete({
                where: {
                    id: channelGroup.id,
                },
            })
            await this.emitChanges(channelGroup.id)
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
