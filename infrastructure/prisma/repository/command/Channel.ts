import { Channel, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { ChannelEntity } from "../../../../domain/entity/Channel"
import { ChannelId } from "../../../../domain/types"
import { IChannelCommandRepository } from "../../../../domain/repository/command/Channel"
import { prisma } from "../client"

export function has_changed(a: Channel, b: Channel) {
    return !(
        a.name === b.name &&
        a.uniqueName === b.uniqueName &&
        a.parentChannelGroupId === b.parentChannelGroupId &&
        a.createdAt?.getTime() === b.createdAt?.getTime() &&
        a.createdBy === b.createdBy &&
        a.statusString === b.statusString &&
        a.messageCount === b.messageCount
    )
}

export class ChannelCommandRepository extends ChangeEventHandler implements IChannelCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super(ChannelCommandRepository)
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(channel: ChannelEntity): Promise<ChannelId> {
        if (channel instanceof ChannelEntity !== true) {
            throw new RepositoryError("`channel` must be an instance of ChannelEntity")
        }
        try {
            const result = await this._prisma.channel.create({
                data: {
                    name: channel.name,
                    uniqueName: channel.uniqueName,
                    parentChannelGroupId: channel.parentChannelGroupId,
                    createdAt: channel.createdAt,
                    createdBy: channel.createdBy,
                    messageCount: channel.messageCount,
                    statusString: channel.statusString,
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
    async update(channel: ChannelEntity): Promise<boolean> {
        if (channel instanceof ChannelEntity !== true) {
            throw new RepositoryError("`channel` must be an instance of ChannelEntity")
        }
        try {
            const origChannel = await this._prisma.channel.findUnique({
                where: {
                    id: channel.id,
                },
            })
            if (origChannel == null) {
                throw new RepositoryError(`Channel not found (id=${channel.id}, uniqueName='${channel.uniqueName}')`)
            }
            const updatedChannel = await this._prisma.channel.update({
                where: {
                    id: channel.id,
                },
                data: {
                    name: channel.name,
                    parentChannelGroupId: channel.parentChannelGroupId,
                    createdAt: channel.createdAt,
                    createdBy: channel.createdBy,
                    messageCount: channel.messageCount,
                    statusString: channel.statusString,
                },
            })
            if (has_changed(origChannel, updatedChannel)) {
                await this.emitChanges(channel.id)
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
    async delete(channel: ChannelEntity): Promise<boolean> {
        if (channel instanceof ChannelEntity !== true) {
            throw new RepositoryError("`channel` must be an instance of ChannelEntity")
        }
        try {
            await this._prisma.channel.delete({
                where: {
                    id: channel.id,
                },
            })
            await this.emitChanges(channel.id)
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
