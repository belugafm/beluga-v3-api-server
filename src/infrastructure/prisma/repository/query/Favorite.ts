import { IFavoriteQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/Favorite"
import { PrismaClient, Favorite } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { MessageId, UserId } from "../../../../domain/types"
import { prisma } from "../client"
import { FavoriteEntity } from "../../../../domain/entity/Favorite"

function toEntity(favorite: Favorite) {
    return new FavoriteEntity({
        id: favorite.id,
        messageId: favorite.messageId,
        userId: favorite.userId,
        createdAt: favorite.createdAt,
    })
}
export class FavoriteQueryRepository implements IFavoriteQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findByMessageAndUserId(messageId: MessageId, userId: UserId): Promise<FavoriteEntity | null> {
        try {
            const favorite = await this._prisma.favorite.findUnique({
                where: {
                    messageId_userId: {
                        messageId,
                        userId,
                    },
                },
            })
            if (favorite == null) {
                return null
            }
            return toEntity(favorite)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "FavoriteQueryRepository::findById")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findAllByMessageId(
        messageId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<FavoriteEntity[]> {
        try {
            const favorites = await this._prisma.favorite.findMany({
                where: {
                    messageId,
                },
            })
            return favorites.map((favorite) => toEntity(favorite))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(
                    error.message,
                    error.stack,
                    "FavoriteQueryRepository::findByRegistrationIpAddress"
                )
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
