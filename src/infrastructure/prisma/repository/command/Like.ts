import { Like, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { LikeEntity } from "../../../../domain/entity/Like"
import { EntityId } from "../../../../domain/types"
import { ILikeCommandRepository } from "../../../../domain/repository/command/Like"
import { prisma } from "../client"

export function hasChanged(a: Like, b: Like) {
    return !(a.count === b.count)
}

export class LikeCommandRepository implements ILikeCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(like: LikeEntity): Promise<EntityId> {
        if (like instanceof LikeEntity !== true) {
            throw new RepositoryError("`like` must be an instance of LikeEntity")
        }
        try {
            const result = await this._prisma.like.create({
                data: {
                    messageId: like.messageId,
                    userId: like.userId,
                    count: like.count,
                    updatedAt: like.updatedAt,
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
    async update(like: LikeEntity): Promise<boolean> {
        if (like instanceof LikeEntity !== true) {
            throw new RepositoryError("`like` must be an instance of LikeEntity")
        }
        try {
            const origLike = await this._prisma.like.findUnique({
                where: {
                    id: like.id,
                },
            })
            if (origLike == null) {
                throw new RepositoryError("Like not found")
            }
            const updatedLike = await this._prisma.like.update({
                where: {
                    id: like.id,
                },
                data: {
                    messageId: like.messageId,
                    userId: like.userId,
                    count: like.count,
                    updatedAt: like.updatedAt,
                },
            })
            if (hasChanged(origLike, updatedLike)) {
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
    async delete(like: LikeEntity): Promise<boolean> {
        if (like instanceof LikeEntity !== true) {
            throw new RepositoryError("`like` must be an instance of LikeEntity")
        }
        try {
            await this._prisma.like.delete({
                where: {
                    id: like.id,
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
