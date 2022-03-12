import { IUsersQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/Users"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { User } from "@prisma/client"
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
        themeColor: user.themeColor,
        backgroundImageUrl: user.backgroundImageUrl,
        defaultProfile: user.defaultProfile,
        statusesCount: user.statusesCount,
        favoritesCount: user.favoritesCount,
        favoritedCount: user.favoritedCount,
        likesCount: user.likesCount,
        likedCount: user.likedCount,
        channelsCount: user.channelsCount,
        followingChannelsCount: user.followingChannelsCount,
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
export class UsersQueryRepository implements IUsersQueryRepository {
    constructor(transaction?: any) {}
    async findById(userId: UserId): Promise<UserEntity | null> {
        try {
            const user = await prisma.user.findUnique({
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
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByName(name: string): Promise<UserEntity | null> {
        try {
            const user = await prisma.user.findUnique({
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
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByTwitterUserId(twitterUserId: string): Promise<UserEntity | null> {
        try {
            const user = await prisma.user.findUnique({
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
                throw new RepositoryError(error.message, error.stack)
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
            const users = await prisma.user.findMany({
                where: {
                    registrationIpAddress: ipAddress,
                },
            })
            const ret: UserEntity[] = []
            users.forEach((user) => {
                ret.push(toEntity(user))
            })
            return ret
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
