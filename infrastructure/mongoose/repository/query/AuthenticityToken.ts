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
import { AuthenticityTokenModel } from "../../schema/AuthenticityToken"
import { IAuthenticityTokenQueryRepository } from "../../../../domain/repository/query/AuthenticityToken"
import { MongoError } from "mongodb"

export class AuthenticityTokenQueryRepository implements IAuthenticityTokenQueryRepository {
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        if (transaction) {
            this._transaction = transaction
        }
    }

    async findBySessionId(sessionId: string): Promise<AuthenticityTokenEntity | null> {
        try {
            const session = this._transaction.getSession()
            const result = await (session
                ? AuthenticityTokenModel.findOne({ session_id: sessionId }, null, { session })
                : AuthenticityTokenModel.findOne({ session_id: sessionId })
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
}
