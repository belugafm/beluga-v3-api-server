import { Like, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { FavoriteEntity } from "../../../../domain/entity/Favorite"
import { EntityId } from "../../../../domain/types"
import { IFavoriteCommandRepository } from "../../../../domain/repository/command/Favorite"
import { prisma } from "../client"

export function hasChanged(a: Like, b: Like) {
    return !(a.count === b.count)
}

export class FavoriteCommandRepository implements IFavoriteCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(favorite: FavoriteEntity): Promise<EntityId> {
        if (favorite instanceof FavoriteEntity !== true) {
            throw new RepositoryError("`favorite` must be an instance of FavoriteEntity")
        }
        try {
            const result = await this._prisma.favorite.create({
                data: {
                    messageId: favorite.messageId,
                    userId: favorite.userId,
                    createdAt: favorite.createdAt,
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
    async delete(favorite: FavoriteEntity): Promise<boolean> {
        if (favorite instanceof FavoriteEntity !== true) {
            throw new RepositoryError("`favorite` must be an instance of FavoriteEntity")
        }
        try {
            await this._prisma.favorite.delete({
                where: {
                    id: favorite.id,
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
