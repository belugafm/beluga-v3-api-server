import * as mongo from "../mongoose"

import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "./Transaction"
import { LoginSessionModel, schemaVersion } from "../schema/LoginSession"
import { SortBy, SortOrder } from "../../../domain/repository/LoginSessions"

import { ILoginSessionsRepository } from "../../../domain/repository/LoginSessions"
import { LoginSessionEntity } from "../../../domain/entity/LoginSession"
import { MongoError } from "mongodb"
import { RepositoryError } from "../../../domain/repository/RepositoryError"

export class LoginSessionsRepository implements ILoginSessionsRepository {
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        if (transaction) {
            this._transaction = transaction
        }
    }
    async add(session: LoginSessionEntity) {
        if (session instanceof LoginSessionEntity !== true) {
            throw new RepositoryError("user.loginCredential not set")
        }
        try {
            const doc = {
                user_id: session.userId,
                session_id: session.sessionId,
                ip_address: session.ipAddress,
                expire_date: session.expireDate,
                created_at: session.createdAt,
                expired: session.expired,
                last_location: session.lastLocation,
                device: session.device,
                schema_version: schemaVersion,
            }
            const _session = this._transaction.getSession()
            if (_session) {
                await LoginSessionModel.create([doc], { session: _session })
            } else {
                await LoginSessionModel.create(doc)
            }
            return
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async deleteAll(userId: UserId) {
        try {
            const user_id = mongo.toObjectId(userId as string)
            const session = this._transaction.getSession()
            const result = await (session
                ? LoginSessionModel.deleteOne({ user_id }, { session }).exec()
                : LoginSessionModel.deleteOne({ user_id }).exec())
            return result.deletedCount ? result.deletedCount : 0
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ) {
        try {
            const user_id = mongo.toObjectId(userId as string)
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
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async update(session: LoginSessionEntity) {
        return true
    }
}
