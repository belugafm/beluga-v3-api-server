import * as mongo from "../mongoose"

import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "./Transaction"
import { IUsersRepository, SortBy, SortOrder } from "../../../domain/repository/Users"
import { UserModel, schemaVersion } from "../schema/User"

import { ChangeEventHandler } from "../../ChangeEventHandler"
import { MongoError } from "mongodb"
import { RepositoryError } from "../../../domain/repository/RepositoryError"
import { UserEntity } from "../../../domain/entity/User"

export class UsersRepository extends ChangeEventHandler implements IUsersRepository {
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        super(UsersRepository)
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
            }
            const session = this._transaction.getSession()
            const results = await (session
                ? UserModel.create([doc], { session })
                : UserModel.create([doc]))
            return results[0]._id.toHexString()
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async activate(user: UserEntity) {
        try {
            if (user.active) {
                return true
            }
            const _id = mongo.toObjectId(user.id as string)
            const result = await UserModel.updateOne(
                { _id },
                {
                    $set: { active: true },
                }
            )
            if (result.nModified == 1) {
                this.emitChanges(user.id)
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
    async updateLastActivityDate(user: UserEntity) {
        try {
            const _id = mongo.toObjectId(user.id as string)
            const result = await UserModel.updateOne(
                { _id },
                {
                    $set: { last_activity_date: new Date() },
                }
            )
            if (result.nModified == 1) {
                this.emitChanges(user.id)
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
    async updateProfile(user: UserEntity) {
        return true
    }
    async delete(userId: UserId) {
        try {
            const _id = mongo.toObjectId(userId as string)
            const session = this._transaction.getSession()
            const result = await (session
                ? UserModel.deleteOne({ _id }, { session }).exec()
                : UserModel.deleteOne({ _id }).exec())
            if (result.deletedCount === 1) {
                this.emitChanges(userId)
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
            const session = this._transaction.getSession()
            const result = await (session
                ? UserModel.findOne({ _id }, null, { session }).exec()
                : UserModel.findOne({ _id }).exec())
            if (result == null) {
                return null
            }
            return result.toEntity()
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async findByName(name: string) {
        try {
            const session = this._transaction.getSession()
            const result = await (session
                ? UserModel.findOne({ name }, null, { session })
                : UserModel.findOne({ name })
            )
                .collation({
                    locale: "en_US",
                    strength: 2,
                })
                .exec()
            if (result == null) {
                return null
            }
            return result.toEntity()
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async findByRegistrationIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ) {
        try {
            const session = this._transaction.getSession()
            const docs = await (session
                ? UserModel.find({ registration_ip_address: ipAddress }, null, { session }).exec()
                : UserModel.find({ registration_ip_address: ipAddress }).exec())
            const ret: UserEntity[] = []
            docs.forEach((user) => {
                ret.push(user.toEntity())
            })
            return ret
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
}
