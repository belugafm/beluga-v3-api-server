import { ChannelReadState, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { ChannelReadStateEntity } from "../../../../domain/entity/ChannelReadState"
import { IChannelReadStateQueryRepository } from "../../../../domain/repository/query/ChannelReadState"
import { isInteger } from "../../../../domain/validation"
import { prisma } from "../client"

export function toEntity(state: ChannelReadState) {
    return new ChannelReadStateEntity({
        id: state.id,
        channelId: state.channelId,
        userId: state.userId,
        lastMessageId: state.lastMessageId,
    })
}

export class ChannelReadStateQueryRepository implements IChannelReadStateQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async find(channelId: number, userId: number): Promise<ChannelReadStateEntity | null> {
        try {
            if (isInteger(userId) !== true) {
                throw new RepositoryError("`userId` must be a number")
            }
            if (isInteger(channelId) !== true) {
                throw new RepositoryError("`channelId` must be a number")
            }
            const state = await this._prisma.channelReadState.findUnique({
                where: {
                    channelId_userId: {
                        channelId,
                        userId,
                    },
                },
            })
            if (state == null) {
                return null
            }
            return toEntity(state)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
