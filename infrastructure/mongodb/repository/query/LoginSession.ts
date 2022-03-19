import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"
import { SortBy, SortOrder } from "../../../../domain/repository/query/LoginSession"

import { ILoginSessionQueryRepository } from "../../../../domain/repository/query/LoginSession"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { LoginSessionModel } from "../../schema/LoginSession"
import { MongoError } from "mongodb"
import { UserId } from "../../../../domain/types"
import mongoose from "mongoose"

export class LoginSessionQueryRepository<T> implements ILoginSessionQueryRepository {
    private _transaction: TransactionRepositoryInterface<T> = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository<T>) {
        if (transaction) {
            this._transaction = transaction
        }
    }
    async findBySessionId(sessionId: string): Promise<LoginSessionEntity | null> {
        try {
            const session = this._transaction.getSession()
            const result = await (session
                ? LoginSessionModel.findOne({ session_id: sessionId }, null, { session })
                : LoginSessionModel.findOne({ session_id: sessionId })
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
    async findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<LoginSessionEntity[]> {
        try {
            const user_id = new mongoose.Types.ObjectId(userId as string)
            const session = this._transaction.getSession()
            const docs = await (session
                ? LoginSessionModel.find({ user_id }, null, { session }).exec()
                : LoginSessionModel.find({ user_id }).exec())
            const ret: LoginSessionEntity[] = []
            docs.forEach((session) => {
                ret.push(session.toEntity())
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
