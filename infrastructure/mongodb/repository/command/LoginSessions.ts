import {
    EmptyTransactionRepository,
    TransactionRepository,
    TransactionRepositoryInterface,
} from "../Transaction"
import { LoginSessionModel, schemaVersion } from "../../schema/LoginSession"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { ILoginSessionsCommandRepository } from "../../../../domain/repository/command/LoginSessions"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { MongoError } from "mongodb"

export class LoginSessionsCommandRepository
    extends ChangeEventHandler
    implements ILoginSessionsCommandRepository
{
    private _transaction: TransactionRepositoryInterface = new EmptyTransactionRepository()
    constructor(transaction?: TransactionRepository) {
        super(LoginSessionsCommandRepository)
        if (transaction) {
            this._transaction = transaction
        }
    }
    async add(session: LoginSessionEntity): Promise<boolean> {
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
    async update(session: LoginSessionEntity): Promise<boolean> {
        try {
            const result = await LoginSessionModel.updateOne(
                { session_id: session.sessionId },
                {
                    $set: {
                        user_id: session.userId as string,
                        ip_address: session.ipAddress,
                        expire_date: session.expireDate,
                        created_at: session.createdAt,
                        expired: session.expired,
                        last_location: session.lastLocation,
                        device: session.device,
                    },
                }
            )
            if (result.modifiedCount == 1) {
                await this.emitChanges(session.sessionId)
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
    async delete(session: LoginSessionEntity): Promise<boolean> {
        try {
            const transSession = this._transaction.getSession()
            const query = { session_id: session.sessionId }
            const result = await (transSession
                ? LoginSessionModel.deleteOne(query, { session: transSession }).exec()
                : LoginSessionModel.deleteOne(query).exec())
            if (result.deletedCount === 1) {
                await this.emitChanges(session.sessionId)
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
