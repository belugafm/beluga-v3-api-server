import { ILikeQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/Like"
import { PrismaClient, Like } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { MessageId, UserId } from "../../../../domain/types"
import { prisma } from "../client"
import { LikeEntity } from "../../../../domain/entity/Like"

function toEntity(like: Like) {
    return new LikeEntity({
        id: like.id,
        messageId: like.messageId,
        userId: like.userId,
        count: like.count,
        updatedAt: like.updatedAt,
    })
}
export class LikeQueryRepository implements ILikeQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findByMessageAndUserId(messageId: MessageId, userId: UserId): Promise<LikeEntity | null> {
        try {
            const like = await this._prisma.like.findUnique({
                where: {
                    messageId_userId: {
                        messageId,
                        userId,
                    },
                },
            })
            if (like == null) {
                return null
            }
            return toEntity(like)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "LikeQueryRepository::findById")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findAllByMessageId(
        messageId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<LikeEntity[]> {
        try {
            const likes = await this._prisma.like.findMany({
                where: {
                    messageId,
                },
            })
            return likes.map((like) => toEntity(like))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(
                    error.message,
                    error.stack,
                    "LikeQueryRepository::findByRegistrationIpAddress"
                )
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
