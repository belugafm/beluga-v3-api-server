import { IUserQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/User"
import { PrismaClient, User } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { UserEntity } from "../../../../domain/entity/User"
import { UserId } from "../../../../domain/types"
import { prisma } from "../client"

function toEntity(user: User) {
    return new UserEntity({
        id: user.id,
        name: user.name,
        twitterUserId: user.twitterUserId,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl,
        location: user.location,
        url: user.url,
        description: user.description,
        messageCount: user.messageCount,
        favoritesCount: user.favoritesCount,
        favoritedCount: user.favoritedCount,
        createdAt: user.createdAt,
        active: user.active,
        dormant: user.dormant,
        suspended: user.suspended,
        trustLevel: user.trustLevel,
        lastActivityDate: user.lastActivityDate,
        termsOfServiceAgreementDate: user.termsOfServiceAgreementDate,
        termsOfServiceAgreementVersion: user.termsOfServiceAgreementVersion,
        registrationIpAddress: user.registrationIpAddress,
    })
}
export class UserQueryRepository implements IUserQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(userId: UserId): Promise<UserEntity | null> {
        try {
            const user = await this._prisma.user.findUnique({
                where: {
                    id: userId,
                },
            })
            if (user == null) {
                return null
            }
            return toEntity(user)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "UserQueryRepository::findById")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByName(name: string): Promise<UserEntity | null> {
        try {
            const user = await this._prisma.user.findUnique({
                where: {
                    name: name,
                },
            })
            if (user == null) {
                return null
            }
            return toEntity(user)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "UserQueryRepository::findByName")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByTwitterUserId(twitterUserId: string): Promise<UserEntity | null> {
        try {
            const user = await this._prisma.user.findUnique({
                where: {
                    twitterUserId: twitterUserId,
                },
            })
            if (user == null) {
                return null
            }
            return toEntity(user)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "UserQueryRepository::findByTwitterUserId")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByRegistrationIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<UserEntity[]> {
        try {
            const users = await this._prisma.user.findMany({
                where: {
                    registrationIpAddress: ipAddress,
                },
            })
            return users.map((user) => toEntity(user))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(
                    error.message,
                    error.stack,
                    "UserQueryRepository::findByRegistrationIpAddress"
                )
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
