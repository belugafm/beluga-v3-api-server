import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"

import { ILoginCredentialsQueryRepository } from "../../../../domain/repository/query/LoginCredentials"
import { LoginCredentialModel } from "../../schema/LoginCredential"
import { MongoError } from "mongodb"
import { RepositoryError } from "../../../../domain/repository/RepositoryError"
import { UserId } from "../../../../domain/types"
import mongoose from "mongoose"

export class LoginCredentialsQueryRepository implements ILoginCredentialsQueryRepository {
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        if (transaction) {
            this._transaction = transaction
        }
    }
    async findByUserId(userId: UserId) {
        try {
            const user_id = mongoose.Types.ObjectId(userId as string)
            const session = this._transaction.getSession()
            const result = await (session
                ? LoginCredentialModel.findOne({ user_id }, null, { session }).exec()
                : LoginCredentialModel.findOne({ user_id }).exec())
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
}
