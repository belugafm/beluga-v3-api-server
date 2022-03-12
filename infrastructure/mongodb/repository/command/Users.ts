import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"
import { UserModel, schemaVersion } from "../../schema/User"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { IUsersCommandRepository } from "../../../../domain/repository/command/Users"
import { MongoError } from "mongodb"
import { UserEntity } from "../../../../domain/entity/User"
import { UserId } from "../../../../domain/types"
import mongoose from "mongoose"

export class UsersCommandRepository extends ChangeEventHandler implements IUsersCommandRepository {
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        super(UsersCommandRepository)
        if (transaction) {
            this._transaction = transaction
        }
    }
    async add(user: UserEntity): Promise<UserId> {
        try {
            const doc = {
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
                statuses_count: user.statusesCount,
                favorites_count: user.favoritesCount,
                favorited_count: user.favoritedCount,
                likes_count: user.likesCount,
                liked_count: user.likedCount,
                channels_count: user.channelsCount,
                following_channels_count: user.followingChannelsCount,
                created_at: user.createdAt,
                bot: user.bot,
                active: user.active,
                dormant: user.dormant,
                suspended: user.suspended,
                trust_level: user.trustLevel,
                last_activity_date: user.lastActivityDate,
                terms_of_service_agreement_date: user.termsOfServiceAgreementDate,
                terms_of_service_agreement_version: user.termsOfServiceAgreementVersion,
                registration_ip_address: user.registrationIpAddress,
                schema_version: schemaVersion,
            }
            const session = this._transaction.getSession()
            const results = await (session
                ? UserModel.create([doc], { session })
                : UserModel.create([doc]))
            const userId = results[0]._id.toHexString()
            return userId
        } catch (error) {
            if (error instanceof Error) {
                if (error instanceof MongoError) {
                    throw new RepositoryError(error.message, error.stack, error.code)
                }
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async update(user: UserEntity): Promise<boolean> {
        try {
            const _id = new mongoose.Types.ObjectId(user.id as string)
            const result = await UserModel.updateOne(
                { _id },
                {
                    $set: {
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
                        statuses_count: user.statusesCount,
                        favorites_count: user.favoritesCount,
                        favorited_count: user.favoritedCount,
                        likes_count: user.likesCount,
                        liked_count: user.likedCount,
                        channels_count: user.channelsCount,
                        following_channels_count: user.followingChannelsCount,
                        created_at: user.createdAt,
                        bot: user.bot,
                        active: user.active,
                        dormant: user.dormant,
                        suspended: user.suspended,
                        trust_level: user.trustLevel,
                        last_activity_date: user.lastActivityDate,
                        terms_of_service_agreement_date: user.termsOfServiceAgreementDate,
                        terms_of_service_agreement_version: user.termsOfServiceAgreementVersion,
                        registration_ip_address: user.registrationIpAddress,
                    },
                }
            )
            if (result.modifiedCount == 1) {
                await this.emitChanges(user.id)
                return true
            }
            return false
        } catch (error) {
            if (error instanceof Error) {
                if (error instanceof MongoError) {
                    throw new RepositoryError(error.message, error.stack, error.code)
                }
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(user: UserEntity): Promise<boolean> {
        try {
            const _id = new mongoose.Types.ObjectId(user.id as string)
            const session = this._transaction.getSession()
            const result = await (session
                ? UserModel.deleteOne({ _id }, { session }).exec()
                : UserModel.deleteOne({ _id }).exec())
            if (result.deletedCount === 1) {
                await this.emitChanges(user.id)
                return true
            }
            return false
        } catch (error) {
            if (error instanceof Error) {
                if (error instanceof MongoError) {
                    throw new RepositoryError(error.message, error.stack, error.code)
                }
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async activate(user: UserEntity): Promise<boolean> {
        if (user.active) {
            return true
        }
        try {
            user.active = true
            return await this.update(user)
        } catch (error) {
            user.active = false
            if (error instanceof Error) {
                if (error instanceof MongoError) {
                    throw new RepositoryError(error.message, error.stack, error.code)
                }
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async updateLastActivityDate(user: UserEntity, date: Date): Promise<boolean> {
        const origValue = user.lastActivityDate
        try {
            user.lastActivityDate = date
            return await this.update(user)
        } catch (error) {
            user.lastActivityDate = origValue
            if (error instanceof Error) {
                if (error instanceof MongoError) {
                    throw new RepositoryError(error.message, error.stack, error.code)
                }
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
