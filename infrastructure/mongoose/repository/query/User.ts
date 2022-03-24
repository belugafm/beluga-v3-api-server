import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"
import { IUserQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/User"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { MongoError } from "mongodb"
import { UserEntity } from "../../../../domain/entity/User"
import { UserId } from "../../../../domain/types"
import { UserModel } from "../../schema/User"
import mongoose from "mongoose"

export class UserQueryRepository<T> implements IUserQueryRepository {
    private _transaction: TransactionRepositoryInterface<T> = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository<T>) {
        if (transaction) {
            this._transaction = transaction
        }
    }
    async findById(userId: UserId): Promise<UserEntity | null> {
        try {
            const _id = new mongoose.Types.ObjectId(userId as string)
            const session = this._transaction.getSession()
            const result = await (session
                ? UserModel.findOne({ _id }, null, { session }).exec()
                : UserModel.findOne({ _id }).exec())
            if (result == null) {
                return null
            }
            return result.toEntity()
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
    async findByName(name: string): Promise<UserEntity | null> {
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
    async findByTwitterUserId(twitterUserId: string): Promise<UserEntity | null> {
        try {
            const session = this._transaction.getSession()
            const result = await (session
                ? UserModel.findOne({ twitter_user_id: twitterUserId }, null, { session })
                : UserModel.findOne({ twitter_user_id: twitterUserId })
            ).exec()
            if (result == null) {
                return null
            }
            return result.toEntity()
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
    async findByRegistrationIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<UserEntity[]> {
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
