import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { ChannelGroupEntity } from "../../../../domain/entity/ChannelGroup"
import { IChannelGroupTimelineCommandRepository } from "../../../../domain/repository/command/ChannelGroupTimeline"
import { MessageEntity } from "../../../../domain/entity/Message"
import { PrismaClient } from "@prisma/client"
import { prisma } from "../client"

export class ChannelGroupTimelineCommandRepository implements IChannelGroupTimelineCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(message: MessageEntity, channelGroup: ChannelGroupEntity): Promise<boolean> {
        if (message instanceof MessageEntity !== true) {
            throw new RepositoryError("`message` must be an instance of ChannelGroupEntity")
        }
        if (channelGroup instanceof ChannelGroupEntity !== true) {
            throw new RepositoryError("`channelGroup` must be an instance of ChannelGroupEntity")
        }
        try {
            await this._prisma.channelGroupTimeline.create({
                data: {
                    messageId: message.id,
                    channelGroupId: channelGroup.id,
                    createdAt: message.createdAt,
                },
            })
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(message: MessageEntity): Promise<boolean> {
        if (message instanceof MessageEntity !== true) {
            throw new RepositoryError("`message` must be an instance of ChannelGroupEntity")
        }
        try {
            await this._prisma.channelGroupTimeline.deleteMany({
                where: {
                    messageId: message.id,
                },
            })
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
