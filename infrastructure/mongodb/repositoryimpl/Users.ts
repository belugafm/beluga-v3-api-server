import * as mongo from "../mongoose"

import { IUsersRepository, SortBy, SortOrder } from "../../../domain/repository/Users"
import { UserModel, schemaVersion } from "../schema/User"

import { MongoError } from "mongodb"
import { RepositoryError } from "../../../domain/repository/RepositoryError"
import { UserEntity } from "../../../domain/entity/User"

export class UsersRepository implements IUsersRepository {
    async add(user: UserEntity): Promise<UserId> {
        try {
            const result = await UserModel.create({
                twitter_user_id: user.twitterUserId,
                name: user.name,
                display_name: user.displayName,
                profile_image_url: user.profileImageUrl,
                location: user.location,
                url: user.url,
                description: user.description,
                theme_color: user.themeColor,
                background_image_url: user.backgroundImageUrl,
                default_profile: user.defaultProfile,
                status_count: user.statusCount,
                favorites_count: user.favoritesCount,
                favorited_count: user.favoritedCount,
                likes_count: user.likesCount,
                liked_count: user.likedCount,
                channels_count: user.channelsCount,
                following_channels_count: user.followingChannelsCount,
                created_at: user.createdAt,
                active: user.active,
                dormant: user.dormant,
                suspended: user.suspended,
                trust_level: user.trustLevel,
                last_activity_date: user.lastActivityDate,
                terms_of_service_agreement_date: user.termsOfServiceAgreementDate,
                terms_of_service_agreement_version: user.termsOfServiceAgreementVersion,
                registration_ip_address: user.registrationIpAddress,
                schema_version: schemaVersion,
            })
            return result._id.toHexString()
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async updateProfile(user: UserEntity) {
        return true
    }
    async delete(userId: UserId) {
        try {
            const _id = mongo.toObjectId(userId as string)
            const result = await UserModel.deleteOne({ _id }).exec()
            if (result.deletedCount === 1) {
                return true
            }
            return false
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async findById(userId: UserId) {
        try {
            const _id = mongo.toObjectId(userId as string)
            const result = await UserModel.findOne({ _id }).exec()
            if (result == null) {
                return null
            }
            return result.toModel()
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async findByName(name: string) {
        try {
            const result = await UserModel.findOne({ name })
                .collation({
                    locale: "en_US",
                    strength: 2,
                })
                .exec()
            if (result == null) {
                return null
            }
            return result.toModel()
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async findByIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ) {
        return []
    }
}
