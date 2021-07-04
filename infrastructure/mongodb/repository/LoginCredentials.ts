import * as mongo from "../mongoose"

import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "./Transaction"
import { LoginCredentialModel, schemaVersion } from "../schema/LoginCredential"

import { ILoginCredentialsRepository } from "../../../domain/repository/LoginCredentials"
import { LoginCredentialEntity } from "../../../domain/entity/LoginCredential"
import { MongoError } from "mongodb"
import { RepositoryError } from "../../../domain/repository/RepositoryError"

export class LoginCredentialsRepository implements ILoginCredentialsRepository {
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        if (transaction) {
            this._transaction = transaction
        }
    }
    async add(credential: LoginCredentialEntity) {
        if (credential instanceof LoginCredentialEntity !== true) {
            throw new RepositoryError("user.loginCredential not set")
        }
        try {
            const doc = {
                user_id: credential.userId,
                password_hash: credential.passwordHash,
                schema_version: schemaVersion,
            }
            const session = this._transaction.getSession()
            if (session) {
                await LoginCredentialModel.create([doc], { session })
            } else {
                await LoginCredentialModel.create(doc)
            }
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async delete(userId: UserId) {
        try {
            const user_id = mongo.toObjectId(userId as string)
            const session = this._transaction.getSession()
            const result = await (session
                ? LoginCredentialModel.deleteOne({ user_id }, { session }).exec()
                : LoginCredentialModel.deleteOne({ user_id }).exec())
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
    async findByUserId(userId: UserId) {
        try {
            const user_id = mongo.toObjectId(userId as string)
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
    async update(credential: LoginCredentialEntity) {
        return
    }
}
