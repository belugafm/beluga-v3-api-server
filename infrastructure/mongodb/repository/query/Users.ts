import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"
import { IUsersQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/Users"

import { MongoError } from "mongodb"
import { RepositoryError } from "../../../../domain/repository/RepositoryError"
import { UserEntity } from "../../../../domain/entity/User"
import { UserId } from "../../../../domain/types"
import { UserModel } from "../../schema/User"
import mongoose from "mongoose"

export class UsersQueryRepository implements IUsersQueryRepository {
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        if (transaction) {
            this._transaction = transaction
        }
    }
    async findById(userId: UserId) {
        try {
            const _id = mongoose.Types.ObjectId(userId as string)
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
