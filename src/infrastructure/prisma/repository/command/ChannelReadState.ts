import { ChannelReadState, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { assignChangeEventHandlerProperties, ChangeEventHandler } from "../ChangeEventHandler"
import { ChannelReadStateEntity } from "../../../../domain/entity/ChannelReadState"
import { ChannelReadStateId } from "../../../../domain/types"
import { IChannelReadStateCommandRepository } from "../../../../domain/repository/command/ChannelReadState"
import { prisma } from "../client"

export function has_changed(a: ChannelReadState, b: ChannelReadState) {
    return !(a.lastMessageId === b.lastMessageId)
}

export class ChannelReadStateCommandRepository
    extends ChangeEventHandler
    implements IChannelReadStateCommandRepository
{
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super()
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async upsert(state: ChannelReadStateEntity): Promise<ChannelReadStateId> {
        if (state instanceof ChannelReadStateEntity !== true) {
            throw new RepositoryError("`state` must be an instance of ChannelReadStateEntity")
        }
        const origState = await this._prisma.channelReadState.findUnique({
            where: {
                channelId_userId: {
                    channelId: state.channelId,
                    userId: state.userId,
                },
            },
        })
        try {
            if (origState) {
                const updatedChannel = await this._prisma.channelReadState.update({
                    where: {
                        id: origState.id,
                    },
                    data: {
                        lastMessageId: state.lastMessageId,
                        lastMessageCreatedAt: state.lastMessageCreatedAt,
                    },
                })
                if (has_changed(origState, updatedChannel)) {
                    await this.emitChanges(state.id)
                }
                return origState.id
            } else {
                const result = await this._prisma.channelReadState.create({
                    data: {
                        channelId: state.channelId,
                        userId: state.userId,
                        lastMessageId: state.lastMessageId,
                        lastMessageCreatedAt: state.lastMessageCreatedAt,
                    },
                })
                return result.id
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async add(state: ChannelReadStateEntity): Promise<ChannelReadStateId> {
        if (state instanceof ChannelReadStateEntity !== true) {
            throw new RepositoryError("`state` must be an instance of ChannelReadStateEntity")
        }
        try {
            const result = await this._prisma.channelReadState.create({
                data: {
                    channelId: state.channelId,
                    userId: state.userId,
                    lastMessageId: state.lastMessageId,
                    lastMessageCreatedAt: state.lastMessageCreatedAt,
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
    async update(state: ChannelReadStateEntity): Promise<boolean> {
        if (state instanceof ChannelReadStateEntity !== true) {
            throw new RepositoryError("`state` must be an instance of ChannelReadStateEntity")
        }
        try {
            const origState = await this._prisma.channelReadState.findUnique({
                where: {
                    id: state.id,
                },
            })
            if (origState == null) {
                throw new RepositoryError(`ChannelReadState not found (id=${state.id}')`)
            }
            const updatedChannel = await this._prisma.channelReadState.update({
                where: {
                    id: state.id,
                },
                data: {
                    lastMessageId: state.lastMessageId,
                    lastMessageCreatedAt: state.lastMessageCreatedAt,
                },
            })
            if (has_changed(origState, updatedChannel)) {
                await this.emitChanges(state.id)
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
    async delete(state: ChannelReadStateEntity): Promise<boolean> {
        if (state instanceof ChannelReadStateEntity !== true) {
            throw new RepositoryError("`state` must be an instance of ChannelReadStateEntity")
        }
        try {
            await this._prisma.channelReadState.delete({
                where: {
                    id: state.id,
                },
            })
            await this.emitChanges(state.id)
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
assignChangeEventHandlerProperties(ChannelReadStateCommandRepository)
