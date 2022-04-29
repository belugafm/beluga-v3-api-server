import { generateRandomIpAddress, generateRandomName } from "../../functions"

import { ChannelEntity } from "../../../../src/domain/entity/Channel"
import { ChannelReadStateEntity } from "../../../../src/domain/entity/ChannelReadState"
import { ChannelTimelineApplication } from "../../../../src/application/timeline/Channel"
import { IChannelCommandRepository } from "../../../../src/domain/repository/command/Channel"
import { IChannelGroupQueryRepository } from "../../../../src/domain/repository/query/ChannelGroup"
import { IChannelGroupTimelineCommandRepository } from "../../../../src/domain/repository/command/ChannelGroupTimeline"
import { IChannelQueryRepository } from "../../../../src/domain/repository/query/Channel"
import { IChannelReadStateCommandRepository } from "../../../../src/domain/repository/command/ChannelReadState"
import { IChannelReadStateQueryRepository } from "../../../../src/domain/repository/query/ChannelReadState"
import { IChannelTimelineQueryRepository } from "../../../../src/domain/repository/query/ChannelTimeline"
import { IMessageCommandRepository } from "../../../../src/domain/repository/command/Message"
import { IMessageQueryRepository } from "../../../../src/domain/repository/query/Message"
import { IUserCommandRepository } from "../../../../src/domain/repository/command/User"
import { IUserQueryRepository } from "../../../../src/domain/repository/query/User"
import { MessageEntity } from "../../../../src/domain/entity/Message"
import { PostMessageApplication } from "../../../../src/application/message/PostMessage"
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

export class ChannelTimelineApplicationTests {
    constructor() {}
    async testNormal<
        A extends IUserQueryRepository,
        B extends IUserCommandRepository,
        C extends IChannelQueryRepository,
        D extends IChannelCommandRepository,
        E extends IChannelGroupQueryRepository,
        F extends IMessageQueryRepository,
        G extends IMessageCommandRepository,
        H extends IChannelGroupTimelineCommandRepository,
        I extends IChannelReadStateQueryRepository,
        J extends IChannelReadStateCommandRepository,
        K extends IChannelTimelineQueryRepository
    >(
        UserQueryRepository: NewableRepository<A>,
        UserCommandRepository: NewableRepository<B>,
        ChannelQueryRepository: NewableRepository<C>,
        ChannelCommandRepository: NewableRepository<D>,
        ChannelGroupQueryRepository: NewableRepository<E>,
        MessageQueryRepository: NewableRepository<F>,
        MessageCommandRepository: NewableRepository<G>,
        ChannelGroupTimelineCommandRepository: NewableRepository<H>,
        ChannelReadStateQueryRepository: NewableRepository<I>,
        ChannelReadStateCommandRepository: NewableRepository<J>,
        ChannelTimelineQueryRepository: NewableRepository<K>,
        TransactionRepository: NewableTransaction
    ) {
        const transaction = await TransactionRepository.new()
        const [user, channel, message1, message2] = await transaction.$transaction(async (transactionSession) => {
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
            const message1 = await new PostMessageApplication(
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
            const message2 = await new PostMessageApplication(
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
            return [user, channel, message1, message2]
        })
        expect(user).toBeInstanceOf(UserEntity)
        expect(channel).toBeInstanceOf(ChannelEntity)
        expect(message1).toBeInstanceOf(MessageEntity)
        expect(message2).toBeInstanceOf(MessageEntity)

        {
            const state = await new ChannelReadStateQueryRepository().find(channel.id, user.id)
            expect(state).toBeNull()
        }

        const messageList = await new ChannelTimelineApplication(
            new ChannelTimelineQueryRepository(),
            new ChannelReadStateCommandRepository()
        ).listMessage({
            userId: user.id,
            channelId: channel.id,
            limit: 50,
            sortOrder: "descending",
        })
        expect(messageList).toHaveLength(2)
        {
            const state = await new ChannelReadStateQueryRepository().find(channel.id, user.id)
            expect(state).toBeInstanceOf(ChannelReadStateEntity)
            expect(state?.lastMessageId).toEqual(message2.id)
        }

        await new UserCommandRepository().delete(user)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message1)
        await new MessageCommandRepository().delete(message2)
    }
}
