import mongoose, { ClientSession } from "mongoose"

import { ITransactionRepository } from "../../../domain/repository/Transaction"

export interface TransactionRepositoryInterface<T> extends ITransactionRepository<T> {
    begin(): void
    commit(): void
    rollback(): void
    end(): void
    $transaction(func: () => T): Promise<T>
    getSession(): ClientSession | null
}

export class TransactionRepository<T> implements TransactionRepositoryInterface<T> {
    private _session: ClientSession
    static async new<T>(): Promise<TransactionRepository<T>> {
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
    async $transaction(func: () => T) {
        await this.begin()
        try {
            const ret = await func()
            await this.commit()
            await this.end()
            return ret
        } catch (error) {
            await this.rollback()
            await this.end()
            throw error
        }
    }
    getSession() {
        return this._session
    }
}

export class EmptyTransactionRepository implements TransactionRepositoryInterface<void> {
    async begin() {}
    async commit() {}
    async rollback() {}
    async end() {}
    async $transaction(func: () => void) {}
    getSession() {
        return null
    }
}
