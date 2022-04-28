import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"
import { LoginCredentialModel, schemaVersion } from "../../schema/LoginCredential"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { ILoginCredentialCommandRepository } from "../../../../domain/repository/command/LoginCredential"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { MongoError } from "mongodb"
import mongoose from "mongoose"

export class LoginCredentialCommandRepository<T>
    extends ChangeEventHandler
    implements ILoginCredentialCommandRepository
{
    private _transaction: TransactionRepositoryInterface<T> = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository<T>) {
        super(LoginCredentialCommandRepository)
        if (transaction) {
            this._transaction = transaction
        }
    }
    async add(credential: LoginCredentialEntity): Promise<boolean> {
        if (credential instanceof LoginCredentialEntity !== true) {
            throw new RepositoryError("XXX")
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
            return true
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
    async delete(credential: LoginCredentialEntity): Promise<boolean> {
        try {
            const user_id = new mongoose.Types.ObjectId(credential.userId as string)
            const session = this._transaction.getSession()
            const result = await (session
                ? LoginCredentialModel.deleteOne({ user_id }, { session }).exec()
                : LoginCredentialModel.deleteOne({ user_id }).exec())
            if (result.deletedCount === 1) {
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
    async update(credential: LoginCredentialEntity): Promise<boolean> {
        try {
            const result = await LoginCredentialModel.updateOne(
                { user_id: credential.userId as string },
                {
                    $set: {
                        password_hash: credential.passwordHash,
                    },
                }
            )
            if (result.modifiedCount == 1) {
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
}
