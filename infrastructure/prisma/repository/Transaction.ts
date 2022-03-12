import { ITransactionRepository } from "../../../domain/repository/Transaction"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export class EmptyTransactionRepository<T> implements ITransactionRepository<T> {
    async begin() {}
    async commit() {}
    async rollback() {}
    async end() {}
    async $transaction(func: () => T) {
        return await func()
    }
}

export class TransactionRepository<T> implements ITransactionRepository<T> {
    static async new<T>(): Promise<TransactionRepository<T>> {
        return new TransactionRepository()
    }
    async begin() {}
    async commit() {}
    async rollback() {}
    async end() {}
    async $transaction(func: () => T) {
        // @ts-ignore
        return (await prisma.$transaction(func)) as T
    }
}
