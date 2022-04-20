import { DeleteMessageApplication, ErrorCodes } from "../../../../application/message/DeleteMessage"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ChannelEntity } from "../../../../domain/entity/Channel"
import { IChannelCommandRepository } from "../../../../domain/repository/command/Channel"
import { IChannelQueryRepository } from "../../../../domain/repository/query/Channel"
import { IMessageCommandRepository } from "../../../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../../../domain/repository/query/Message"
import { IUserCommandRepository } from "../../../../domain/repository/command/User"
import { IUserQueryRepository } from "../../../../domain/repository/query/User"
import { MessageEntity } from "../../../../domain/entity/Message"
import { PostMessageApplication } from "../../../../application/message/PostMessage"
import { PrismaClient } from "@prisma/client"
import { TransactionRepository } from "../../../../web/repositories"
import { UserEntity } from "../../../../domain/entity/User"
import config from "../../../../config/app"
import { generateRandomName } from "../../functions"

interface NewableRepository<T> {
    new (transaction?: PrismaClient): T
}

type NewableTransaction = {
    new: () => Promise<TransactionRepository<any>>
}

export class DeleteMessageApplicationTests {
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

        const transaction = await TransactionRepository.new()
        const [user, channel, message] = await transaction.$transaction(async (transactionSession) => {
            const user = new UserEntity({
                id: -1,
                name: generateRandomName(config.user.name.max_length),
                registrationIpAddress: "192.168.1.1",
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
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
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

        const succeeded = await new DeleteMessageApplication(
            new UserQueryRepository(),
            new UserCommandRepository(),
            new ChannelQueryRepository(),
            new ChannelCommandRepository(),
            new MessageQueryRepository(),
            new MessageCommandRepository()
        ).delete({ messageId: message.id, requestUserId: user.id })
        expect(succeeded).toBe(true)
        {
            const updatedUser = await new UserQueryRepository().findById(user.id)
            expect(updatedUser).toBeInstanceOf(UserEntity)
            expect(updatedUser?.messageCount).toEqual(0)
        }
        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message)
    }
    async testRiskyUser<
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
                registrationIpAddress: "192.168.1.1",
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
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
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
                new MessageCommandRepository()
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
                registrationIpAddress: "192.168.1.1",
                trustLevel: trustLevel,
            })
            author.id = await new UserCommandRepository(transactionSession).add(author)
            const other = new UserEntity({
                id: -1,
                name: generateRandomName(config.user.name.max_length),
                registrationIpAddress: "192.168.1.1",
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
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession)
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
                new MessageCommandRepository()
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
