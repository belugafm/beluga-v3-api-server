import { AuthenticityTokenModel, schemaVersion } from "../../schema/AuthenticityToken"
import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { AuthenticityTokenEntity } from "../../../../domain/entity/AuthenticityToken"
import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { IAuthenticityTokenCommandRepository } from "../../../../domain/repository/command/AuthenticityToken"
import { MongoError } from "mongodb"

export class AuthenticityTokenCommandRepository<T>
    extends ChangeEventHandler
    implements IAuthenticityTokenCommandRepository
{
    private _transaction: TransactionRepositoryInterface<T> = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository<T>) {
        super(AuthenticityTokenCommandRepository)
        if (transaction) {
            this._transaction = transaction
        }
    }
    async add(auth: AuthenticityTokenEntity): Promise<boolean> {
        if (auth instanceof AuthenticityTokenEntity !== true) {
            throw new RepositoryError("XXX")
        }
        try {
            const doc = {
                session_id: auth.sessionId,
                token: auth.token,
                schema_version: schemaVersion,
            }
            const _session = this._transaction.getSession()
            if (_session) {
                await AuthenticityTokenModel.create([doc], { session: _session })
            } else {
                await AuthenticityTokenModel.create(doc)
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
    async delete(auth: AuthenticityTokenEntity): Promise<boolean> {
        try {
            const transSession = this._transaction.getSession()
            const query = { session_id: auth.sessionId }
            const result = await (transSession
                ? AuthenticityTokenModel.deleteOne(query, { session: transSession }).exec()
                : AuthenticityTokenModel.deleteOne(query).exec())
            if (result.deletedCount === 1) {
                await this.emitChanges(auth.sessionId)
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
