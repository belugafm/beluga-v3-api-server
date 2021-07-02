import mongoose, { ClientSession } from "mongoose"

import { ITransactionRepository } from "../../../domain/repository/Transaction"

export interface TransactionRepositoryInterface extends ITransactionRepository {
    begin(): void
    commit(): void
    rollback(): void
    end(): void
    getSession(): ClientSession | null
}

export class TransactionRepository implements TransactionRepositoryInterface {
    private _session: ClientSession
    static async new() {
        const session = await mongoose.startSession()
        return new TransactionRepository(session)
    }
    constructor(session: ClientSession) {
        this._session = session
    }
    async begin() {
        this._session.startTransaction()
    }
    async commit() {
        await this._session.commitTransaction()
    }
    async rollback() {
        await this._session.abortTransaction()
    }
    async end() {
        await this._session.endSession()
    }
    getSession() {
        return this._session
    }
}

export class EmptyTransactionRepository implements TransactionRepositoryInterface {
    async begin() {}
    async commit() {}
    async rollback() {}
    async end() {}
    getSession() {
        return null
    }
}
