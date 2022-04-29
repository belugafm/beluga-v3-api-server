import { ErrorCodes, PostMessageApplication } from "../../../../src/application/message/PostMessage"
import { generateRandomIpAddress, generateRandomName, sleep } from "../../functions"

import { ApplicationError } from "../../../../src/application/ApplicationError"
import { ChannelEntity } from "../../../../src/domain/entity/Channel"
import { IChannelCommandRepository } from "../../../../src/domain/repository/command/Channel"
import { IChannelGroupQueryRepository } from "../../../../src/domain/repository/query/ChannelGroup"
import { IChannelGroupTimelineCommandRepository } from "../../../../src/domain/repository/command/ChannelGroupTimeline"
import { IChannelQueryRepository } from "../../../../src/domain/repository/query/Channel"
import { IMessageCommandRepository } from "../../../../src/domain/repository/command/Message"
import { IMessageQueryRepository } from "../../../../src/domain/repository/query/Message"
import { IUserCommandRepository } from "../../../../src/domain/repository/command/User"
import { IUserQueryRepository } from "../../../../src/domain/repository/query/User"
import { MessageEntity } from "../../../../src/domain/entity/Message"
import { PrismaClient } from "@prisma/client"
import { TransactionRepository } from "../../../../src/infrastructure/prisma/repository/Transaction"
import { UserEntity } from "../../../../src/domain/entity/User"
import config from "../../../../src/config/app"

interface NewableRepository<T> {
    new (transaction?: PrismaClient): T
}

type NewableTransaction = {
    new: () => Promise<TransactionRepository<any>>
}

export class PostMessageApplicationTests {
    constructor() {}
    async testNormal<
        A extends IUserQueryRepository,
        B extends IUserCommandRepository,
        C extends IChannelQueryRepository,
        D extends IChannelCommandRepository,
        E extends IChannelGroupQueryRepository,
        F extends IMessageQueryRepository,
        G extends IMessageCommandRepository,
        H extends IChannelGroupTimelineCommandRepository
    >(
        UserQueryRepository: NewableRepository<A>,
        UserCommandRepository: NewableRepository<B>,
        ChannelQueryRepository: NewableRepository<C>,
        ChannelCommandRepository: NewableRepository<D>,
        ChannelGroupQueryRepository: NewableRepository<E>,
        MessageQueryRepository: NewableRepository<F>,
        MessageCommandRepository: NewableRepository<G>,
        ChannelGroupTimelineCommandRepository: NewableRepository<H>,
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
            registrationIpAddress: generateRandomIpAddress(),
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
                new ChannelGroupQueryRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession),
                new ChannelGroupTimelineCommandRepository(transactionSession)
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
                new ChannelGroupQueryRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession),
                new ChannelGroupTimelineCommandRepository(transactionSession)
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

        const updatedChannel = await new ChannelQueryRepository().findById(channel.id)
        expect(updatedChannel).toBeInstanceOf(ChannelEntity)
        expect(updatedChannel?.lastMessageId).toEqual(message.id)

        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message)
        await new MessageCommandRepository().delete(thread)
    }
    async testVisitorRateLimittingFailureCase<
        A extends IUserQueryRepository,
        B extends IUserCommandRepository,
        C extends IChannelQueryRepository,
        D extends IChannelCommandRepository,
        E extends IChannelGroupQueryRepository,
        F extends IMessageQueryRepository,
        G extends IMessageCommandRepository,
        H extends IChannelGroupTimelineCommandRepository
    >(
        UserQueryRepository: NewableRepository<A>,
        UserCommandRepository: NewableRepository<B>,
        ChannelQueryRepository: NewableRepository<C>,
        ChannelCommandRepository: NewableRepository<D>,
        ChannelGroupQueryRepository: NewableRepository<E>,
        MessageQueryRepository: NewableRepository<F>,
        MessageCommandRepository: NewableRepository<G>,
        ChannelGroupTimelineCommandRepository: NewableRepository<H>,
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
            registrationIpAddress: generateRandomIpAddress(),
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
                    new ChannelGroupQueryRepository(transactionSession),
                    new MessageQueryRepository(transactionSession),
                    new MessageCommandRepository(transactionSession),
                    new ChannelGroupTimelineCommandRepository(transactionSession)
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
                    new ChannelGroupQueryRepository(transactionSession),
                    new MessageQueryRepository(transactionSession),
                    new MessageCommandRepository(transactionSession),
                    new ChannelGroupTimelineCommandRepository(transactionSession)
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
        A extends IUserQueryRepository,
        B extends IUserCommandRepository,
        C extends IChannelQueryRepository,
        D extends IChannelCommandRepository,
        E extends IChannelGroupQueryRepository,
        F extends IMessageQueryRepository,
        G extends IMessageCommandRepository,
        H extends IChannelGroupTimelineCommandRepository
    >(
        UserQueryRepository: NewableRepository<A>,
        UserCommandRepository: NewableRepository<B>,
        ChannelQueryRepository: NewableRepository<C>,
        ChannelCommandRepository: NewableRepository<D>,
        ChannelGroupQueryRepository: NewableRepository<E>,
        MessageQueryRepository: NewableRepository<F>,
        MessageCommandRepository: NewableRepository<G>,
        ChannelGroupTimelineCommandRepository: NewableRepository<H>,
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
            registrationIpAddress: generateRandomIpAddress(),
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
                new ChannelGroupQueryRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession),
                new ChannelGroupTimelineCommandRepository(transactionSession)
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
                new ChannelGroupQueryRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession),
                new ChannelGroupTimelineCommandRepository(transactionSession)
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
