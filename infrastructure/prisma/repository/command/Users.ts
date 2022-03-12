import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { IUsersCommandRepository } from "../../../../domain/repository/command/Users"
import { User } from "@prisma/client"
import { UserEntity } from "../../../../domain/entity/User"
import { UserId } from "../../../../domain/types"
import { prisma } from "../client"

export function has_changed(a: UserEntity, b: User) {
    return !(
        a.twitterUserId === b.twitterUserId &&
        a.name === b.name &&
        a.displayName === b.displayName &&
        a.profileImageUrl === b.profileImageUrl &&
        a.location === b.location &&
        a.url === b.url &&
        a.description === b.description &&
        a.themeColor === b.themeColor &&
        a.backgroundImageUrl === b.backgroundImageUrl &&
        a.defaultProfile === b.defaultProfile &&
        a.statusesCount === b.statusesCount &&
        a.favoritesCount === b.favoritesCount &&
        a.favoritedCount === b.favoritedCount &&
        a.likesCount === b.likesCount &&
        a.likedCount === b.likedCount &&
        a.channelsCount === b.channelsCount &&
        a.followingChannelsCount === b.followingChannelsCount &&
        a.createdAt?.getTime() === b.createdAt?.getTime() &&
        a.bot === b.bot &&
        a.active === b.active &&
        a.dormant === b.dormant &&
        a.suspended === b.suspended &&
        a.trustLevel === b.trustLevel &&
        a.lastActivityDate?.getTime() === b.lastActivityDate?.getTime() &&
        a.termsOfServiceAgreementDate?.getTime() === b.termsOfServiceAgreementDate?.getTime() &&
        a.termsOfServiceAgreementVersion === b.termsOfServiceAgreementVersion &&
        a.registrationIpAddress === b.registrationIpAddress
    )
}

export class UsersCommandRepository extends ChangeEventHandler implements IUsersCommandRepository {
    constructor(transaction?: any) {
        super(UsersCommandRepository)
    }
    async add(user: UserEntity): Promise<UserId> {
        if (user instanceof UserEntity !== true) {
            throw new RepositoryError("`user` must be an instance of UserEntity")
        }
        try {
            const result = await prisma.user.create({
                data: {
                    twitterUserId: user.twitterUserId,
                    name: user.name,
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
                    bot: user.bot,
                    active: user.active,
                    dormant: user.dormant,
                    suspended: user.suspended,
                    trustLevel: user.trustLevel,
                    lastActivityDate: user.lastActivityDate,
                    termsOfServiceAgreementDate: user.termsOfServiceAgreementDate,
                    termsOfServiceAgreementVersion: user.termsOfServiceAgreementVersion,
                    registrationIpAddress: user.registrationIpAddress,
                },
            })
            const userId = result.id
            return userId
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async update(user: UserEntity): Promise<boolean> {
        if (user instanceof UserEntity !== true) {
            throw new RepositoryError("`user` must be an instance of UserEntity")
        }
        try {
            const updatedUser = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    twitterUserId: user.twitterUserId,
                    name: user.name,
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
                    bot: user.bot,
                    active: user.active,
                    dormant: user.dormant,
                    suspended: user.suspended,
                    trustLevel: user.trustLevel,
                    lastActivityDate: user.lastActivityDate,
                    termsOfServiceAgreementDate: user.termsOfServiceAgreementDate,
                    termsOfServiceAgreementVersion: user.termsOfServiceAgreementVersion,
                    registrationIpAddress: user.registrationIpAddress,
                },
            })
            if (has_changed(user, updatedUser)) {
                await this.emitChanges(user.id)
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
    async delete(user: UserEntity): Promise<boolean> {
        if (user instanceof UserEntity !== true) {
            throw new RepositoryError("`user` must be an instance of UserEntity")
        }
        try {
            await prisma.user.delete({
                where: {
                    id: user.id,
                },
            })
            await this.emitChanges(user.id)
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async activate(user: UserEntity): Promise<boolean> {
        if (user instanceof UserEntity !== true) {
            throw new RepositoryError("`user` must be an instance of UserEntity")
        }
        if (user.active) {
            return true
        }
        try {
            user.active = true
            return await this.update(user)
        } catch (error) {
            user.active = false
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async updateLastActivityDate(user: UserEntity, date: Date): Promise<boolean> {
        if (user instanceof UserEntity !== true) {
            throw new RepositoryError("`user` must be an instance of UserEntity")
        }
        const origValue = user.lastActivityDate
        try {
            user.lastActivityDate = date
            return await this.update(user)
        } catch (error) {
            user.lastActivityDate = origValue
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
