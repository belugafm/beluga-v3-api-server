import { ErrorCodes, PostMessageApplication } from "../../../../application/message/PostMessage"
import { generateRandomName, sleep } from "../../functions"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ChannelEntity } from "../../../../domain/entity/Channel"
import { IChannelCommandRepository } from "../../../../domain/repository/command/Channel"
import { IChannelQueryRepository } from "../../../../domain/repository/query/Channel"
import { IMessageCommandRepository } from "../../../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../../../domain/repository/query/Message"
import { IUserCommandRepository } from "../../../../domain/repository/command/User"
import { IUserQueryRepository } from "../../../../domain/repository/query/User"
import { MessageEntity } from "../../../../domain/entity/Message"
import { PrismaClient } from "@prisma/client"
import { TransactionRepository } from "../../../../infrastructure/prisma/repository/Transaction"
import { UserEntity } from "../../../../domain/entity/User"
import config from "../../../../config/app"

interface NewableRepository<T> {
    new (transaction?: PrismaClient): T
}

type NewableTransaction = {
    new: () => Promise<TransactionRepository<any>>
}

export class PostMessageApplicationTests {
    constructor() {}
    async testNormal<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelQueryRepository,
        V extends IChannelCommandRepository,
        W extends IMessageQueryRepository,
        X extends IMessageCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelQueryRepository: NewableRepository<U>,
        ChannelCommandRepository: NewableRepository<V>,
        MessageQueryRepository: NewableRepository<W>,
        MessageCommandRepository: NewableRepository<X>,
        TransactionRepository: NewableTransaction
    ) {
        const trustLevel = UserEntity.getInitialTrustLevel({
            signedUpWithTwitter: false,
            invitedByAuthorizedUser: true,
            twitterAccountCreatedAt: null,
        })
        const user = new UserEntity({
            id: -1,
            name: generateRandomName(config.user.name.max_length),
            registrationIpAddress: "192.168.1.1",
            trustLevel: trustLevel,
        })
        user.id = await new UserCommandRepository().add(user)
        const channel = new ChannelEntity({
            id: -1,
            name: "channel",
            uniqueName: ChannelEntity.generateUniqueName(),
            parentChannelGroupId: 1,
            createdBy: user.id,
            createdAt: new Date(),
        })
        channel.id = await new ChannelCommandRepository().add(channel)

        const transaction = await TransactionRepository.new()
        const [thread, message] = await transaction.$transaction(async (transactionSession) => {
            const thread = await new PostMessageApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new ChannelQueryRepository(transactionSession),
                new ChannelCommandRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
            ).post({
                text: "hogehoge",
                channelId: channel.id,
                userId: user.id,
            })
            const message = await new PostMessageApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new ChannelQueryRepository(transactionSession),
                new ChannelCommandRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
            ).post({
                text: "hogehoge",
                userId: user.id,
                threadId: thread.id,
            })
            return [thread, message]
        })
        expect(thread).toBeInstanceOf(MessageEntity)
        expect(message).toBeInstanceOf(MessageEntity)

        const updatedThread = await new MessageQueryRepository().findById(thread.id)
        expect(updatedThread).toBeInstanceOf(MessageEntity)
        expect(updatedThread?.replyCount).toEqual(1)

        const updatedUser = await new UserQueryRepository().findById(user.id)
        expect(updatedUser).toBeInstanceOf(UserEntity)
        expect(updatedUser?.messageCount).toEqual(2)

        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message)
        await new MessageCommandRepository().delete(thread)
    }
    async testVisitorRateLimittingFailureCase<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelQueryRepository,
        V extends IChannelCommandRepository,
        W extends IMessageQueryRepository,
        X extends IMessageCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelQueryRepository: NewableRepository<U>,
        ChannelCommandRepository: NewableRepository<V>,
        MessageQueryRepository: NewableRepository<W>,
        MessageCommandRepository: NewableRepository<X>,
        TransactionRepository: NewableTransaction
    ) {
        expect.assertions(4)
        const trustLevel = UserEntity.getInitialTrustLevel({
            signedUpWithTwitter: false,
            invitedByAuthorizedUser: false,
            twitterAccountCreatedAt: null,
        })
        const user = new UserEntity({
            id: -1,
            name: generateRandomName(config.user.name.max_length),
            registrationIpAddress: "192.168.1.1",
            trustLevel: trustLevel,
        })
        user.id = await new UserCommandRepository().add(user)
        const channel = new ChannelEntity({
            id: -1,
            name: "channel",
            uniqueName: ChannelEntity.generateUniqueName(),
            parentChannelGroupId: 1,
            createdBy: user.id,
            createdAt: new Date(),
        })
        channel.id = await new ChannelCommandRepository().add(channel)

        const transaction = await TransactionRepository.new()

        try {
            await transaction.$transaction(async (transactionSession) => {
                const thread = await new PostMessageApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new ChannelQueryRepository(transactionSession),
                    new ChannelCommandRepository(transactionSession),
                    new MessageQueryRepository(transactionSession),
                    new MessageCommandRepository(transactionSession)
                ).post({
                    text: "hogehoge",
                    channelId: channel.id,
                    userId: user.id,
                })
                const message = await new PostMessageApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new ChannelQueryRepository(transactionSession),
                    new ChannelCommandRepository(transactionSession),
                    new MessageQueryRepository(transactionSession),
                    new MessageCommandRepository(transactionSession)
                ).post({
                    text: "hogehoge",
                    userId: user.id,
                    threadId: thread.id,
                })
                return [thread, message]
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.RateLimitExceeded)
            }
        }
        const updatedUser = await new UserQueryRepository().findById(user.id)
        expect(updatedUser).toBeInstanceOf(UserEntity)
        expect(updatedUser?.messageCount).toEqual(0)

        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
    }
    async testVisitorRateLimittingSuccessfulCase<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelQueryRepository,
        V extends IChannelCommandRepository,
        W extends IMessageQueryRepository,
        X extends IMessageCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelQueryRepository: NewableRepository<U>,
        ChannelCommandRepository: NewableRepository<V>,
        MessageQueryRepository: NewableRepository<W>,
        MessageCommandRepository: NewableRepository<X>,
        TransactionRepository: NewableTransaction
    ) {
        const trustLevel = UserEntity.getInitialTrustLevel({
            signedUpWithTwitter: false,
            invitedByAuthorizedUser: false,
            twitterAccountCreatedAt: null,
        })
        const user = new UserEntity({
            id: -1,
            name: generateRandomName(config.user.name.max_length),
            registrationIpAddress: "192.168.1.1",
            trustLevel: trustLevel,
        })
        user.id = await new UserCommandRepository().add(user)
        const channel = new ChannelEntity({
            id: -1,
            name: "channel",
            uniqueName: ChannelEntity.generateUniqueName(),
            parentChannelGroupId: 1,
            createdBy: user.id,
            createdAt: new Date(),
        })
        channel.id = await new ChannelCommandRepository().add(channel)

        const transaction = await TransactionRepository.new()

        const [thread, message] = await transaction.$transaction(async (transactionSession) => {
            const thread = await new PostMessageApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new ChannelQueryRepository(transactionSession),
                new ChannelCommandRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
            ).post({
                text: "hogehoge",
                channelId: channel.id,
                userId: user.id,
            })
            await sleep(config.message.wait_until / 1000 + 1)
            const message = await new PostMessageApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new ChannelQueryRepository(transactionSession),
                new ChannelCommandRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
            ).post({
                text: "hogehoge",
                userId: user.id,
                threadId: thread.id,
            })
            return [thread, message]
        })
        const updatedUser = await new UserQueryRepository().findById(user.id)
        expect(updatedUser).toBeInstanceOf(UserEntity)
        expect(updatedUser?.messageCount).toEqual(2)

        const updatedThread = await new MessageQueryRepository().findById(thread.id)
        expect(updatedThread).toBeInstanceOf(MessageEntity)
        expect(updatedThread?.replyCount).toEqual(1)

        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message)
        await new MessageCommandRepository().delete(thread)
    }
}
