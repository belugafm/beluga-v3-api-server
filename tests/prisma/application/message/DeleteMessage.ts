import { DeleteMessageApplication, ErrorCodes } from "../../../../src/application/message/DeleteMessage"
import { generateRandomIpAddress, generateRandomName } from "../../functions"

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
import { PostMessageApplication } from "../../../../src/application/message/PostMessage"
import { PrismaClient } from "@prisma/client"
import { TransactionRepository } from "../../../../src/web/repositories"
import { UserEntity } from "../../../../src/domain/entity/User"
import config from "../../../../src/config/app"

interface NewableRepository<T> {
    new (transaction?: PrismaClient): T
}

type NewableTransaction = {
    new: () => Promise<TransactionRepository<any>>
}

export class DeleteMessageApplicationTests {
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

        const transaction = await TransactionRepository.new()
        const [user, channel, message] = await transaction.$transaction(async (transactionSession) => {
            const user = new UserEntity({
                id: -1,
                name: generateRandomName(config.user.name.max_length),
                registrationIpAddress: generateRandomIpAddress(),
                trustLevel: trustLevel,
            })
            user.id = await new UserCommandRepository(transactionSession).add(user)
            const channel = new ChannelEntity({
                id: -1,
                name: "channel",
                uniqueName: ChannelEntity.generateUniqueName(),
                parentChannelGroupId: 1,
                createdBy: user.id,
                createdAt: new Date(),
            })
            channel.id = await new ChannelCommandRepository(transactionSession).add(channel)
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
                channelId: channel.id,
            })
            return [user, channel, message]
        })
        expect(message).toBeInstanceOf(MessageEntity)
        {
            const updatedUser = await new UserQueryRepository().findById(user.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(1)

            const updatedChannel = await new ChannelQueryRepository().findById(channel.id)
            expect(updatedChannel).toBeInstanceOf(ChannelEntity)
            expect(updatedChannel?.lastMessageId).toEqual(message.id)
        }

        const succeeded = await new DeleteMessageApplication(
            new UserQueryRepository(),
            new UserCommandRepository(),
            new ChannelQueryRepository(),
            new ChannelCommandRepository(),
            new MessageQueryRepository(),
            new MessageCommandRepository(),
            new ChannelGroupTimelineCommandRepository()
        ).delete({ messageId: message.id, requestUserId: user.id })
        expect(succeeded).toBe(true)
        {
            const updatedUser = await new UserQueryRepository().findById(user.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(0)

            const updatedChannel = await new ChannelQueryRepository().findById(channel.id)
            expect(updatedChannel).toBeInstanceOf(ChannelEntity)
            expect(updatedChannel?.lastMessageId).toBeNull()
        }
        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message)
    }
    async testRiskyUser<
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
        expect.assertions(7)
        const trustLevel = UserEntity.getInitialTrustLevel({
            signedUpWithTwitter: false,
            invitedByAuthorizedUser: false,
            twitterAccountCreatedAt: null,
        })

        const transaction = await TransactionRepository.new()
        const [user, channel, message] = await transaction.$transaction(async (transactionSession) => {
            const user = new UserEntity({
                id: -1,
                name: generateRandomName(config.user.name.max_length),
                registrationIpAddress: generateRandomIpAddress(),
                trustLevel: trustLevel,
            })
            user.id = await new UserCommandRepository(transactionSession).add(user)
            const channel = new ChannelEntity({
                id: -1,
                name: "channel",
                uniqueName: ChannelEntity.generateUniqueName(),
                parentChannelGroupId: 1,
                createdBy: user.id,
                createdAt: new Date(),
            })
            channel.id = await new ChannelCommandRepository(transactionSession).add(channel)
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
                channelId: channel.id,
            })
            return [user, channel, message]
        })
        expect(message).toBeInstanceOf(MessageEntity)
        {
            const updatedUser = await new UserQueryRepository().findById(user.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(1)
        }
        try {
            await new DeleteMessageApplication(
                new UserQueryRepository(),
                new UserCommandRepository(),
                new ChannelQueryRepository(),
                new ChannelCommandRepository(),
                new MessageQueryRepository(),
                new MessageCommandRepository(),
                new ChannelGroupTimelineCommandRepository()
            ).delete({ messageId: message.id, requestUserId: user.id })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.DoNotHavePermission)
            }
        }
        {
            const updatedUser = await new UserQueryRepository().findById(user.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(1)
        }
        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message)
    }
    async testOtherUser<
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
        expect.assertions(11)
        const trustLevel = UserEntity.getInitialTrustLevel({
            signedUpWithTwitter: false,
            invitedByAuthorizedUser: true,
            twitterAccountCreatedAt: null,
        })

        const transaction = await TransactionRepository.new()
        const [author, other, channel, message] = await transaction.$transaction(async (transactionSession) => {
            const author = new UserEntity({
                id: -1,
                name: generateRandomName(config.user.name.max_length),
                registrationIpAddress: generateRandomIpAddress(),
                trustLevel: trustLevel,
            })
            author.id = await new UserCommandRepository(transactionSession).add(author)
            const other = new UserEntity({
                id: -1,
                name: generateRandomName(config.user.name.max_length),
                registrationIpAddress: generateRandomIpAddress(),
                trustLevel: trustLevel,
            })
            other.id = await new UserCommandRepository(transactionSession).add(other)
            const channel = new ChannelEntity({
                id: -1,
                name: "channel",
                uniqueName: ChannelEntity.generateUniqueName(),
                parentChannelGroupId: 1,
                createdBy: other.id,
                createdAt: new Date(),
            })
            channel.id = await new ChannelCommandRepository(transactionSession).add(channel)
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
                userId: author.id,
                channelId: channel.id,
            })
            return [author, other, channel, message]
        })
        expect(message).toBeInstanceOf(MessageEntity)
        {
            const updatedUser = await new UserQueryRepository().findById(author.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(1)
        }
        {
            const updatedUser = await new UserQueryRepository().findById(other.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(0)
        }
        try {
            await new DeleteMessageApplication(
                new UserQueryRepository(),
                new UserCommandRepository(),
                new ChannelQueryRepository(),
                new ChannelCommandRepository(),
                new MessageQueryRepository(),
                new MessageCommandRepository(),
                new ChannelGroupTimelineCommandRepository()
            ).delete({ messageId: message.id, requestUserId: other.id })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.DoNotHavePermission)
            }
        }
        {
            const updatedUser = await new UserQueryRepository().findById(author.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(1)
        }
        {
            const updatedUser = await new UserQueryRepository().findById(other.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(0)
        }
        await new UserCommandRepository().delete(author)
        await new UserCommandRepository().delete(other)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message)
    }
}
