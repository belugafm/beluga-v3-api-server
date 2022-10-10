import { ITransactionRepository } from "../../../domain/repository/Transaction"
import { PrismaClient } from "@prisma/client"
import { UserCommandRepository } from "./command/User"
import { ChannelCommandRepository } from "./command/Channel"
import { ChannelGroupCommandRepository } from "./command/ChannelGroup"
import { ChannelReadStateCommandRepository } from "./command/ChannelReadState"
import { FileCommandRepository } from "./command/File"
import { LoginSessionCommandRepository } from "./command/LoginSession"
import { MessageCommandRepository } from "./command/Message"
import { SetWithTransaction } from "./WithTransaction"
const prisma = new PrismaClient()

export class EmptyTransactionRepository<T> implements ITransactionRepository<T> {
    async $transaction(func: (session: any) => T) {
        return await func(null)
    }
}

export class TransactionRepository<T> implements ITransactionRepository<T> {
    static async new<T>(): Promise<TransactionRepository<T>> {
        return new TransactionRepository()
    }
    async $transaction(func: (session: any) => T): Promise<T> {
        SetWithTransaction(true)
        try {
            // @ts-ignore
            const ret = (await prisma.$transaction(func)) as T
            SetWithTransaction(false)
            ChannelCommandRepository.lazyEmitChanges()
            ChannelGroupCommandRepository.lazyEmitChanges()
            ChannelReadStateCommandRepository.lazyEmitChanges()
            FileCommandRepository.lazyEmitChanges()
            LoginSessionCommandRepository.lazyEmitChanges()
            MessageCommandRepository.lazyEmitChanges()
            UserCommandRepository.lazyEmitChanges()
            return ret
        } catch (error) {
            SetWithTransaction(false)
            throw error
        }
    }
}
