import { generateRandomIpAddress, generateRandomName } from "../functions"

import { ChannelEntity } from "../../../domain/entity/Channel"
import { ChannelGroupEntity } from "../../../domain/entity/ChannelGroup"
import { IChannelCommandRepository } from "../../../domain/repository/command/Channel"
import { IChannelGroupCommandRepository } from "../../../domain/repository/command/ChannelGroup"
import { IChannelGroupQueryRepository } from "../../../domain/repository/query/ChannelGroup"
import { IChannelGroupTimelineCommandRepository } from "../../../domain/repository/command/ChannelGroupTimeline"
import { IChannelGroupTimelineQueryRepository } from "../../../domain/repository/query/ChannelGroupTimeline"
import { IChannelQueryRepository } from "../../../domain/repository/query/Channel"
import { IMessageCommandRepository } from "../../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../../domain/repository/query/Message"
import { IUserCommandRepository } from "../../../domain/repository/command/User"
import { IUserQueryRepository } from "../../../domain/repository/query/User"
import { MessageEntity } from "../../../domain/entity/Message"
import { PostMessageApplication } from "../../../application/message/PostMessage"
import { PrismaClient } from "@prisma/client"
import { TransactionRepository } from "../../../infrastructure/prisma/repository/Transaction"
import { UserEntity } from "../../../domain/entity/User"
import config from "../../../src/config/app"

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
        F extends IChannelGroupCommandRepository,
        G extends IMessageQueryRepository,
        H extends IMessageCommandRepository,
        I extends IChannelGroupTimelineQueryRepository,
        J extends IChannelGroupTimelineCommandRepository
    >(
        UserQueryRepository: NewableRepository<A>,
        UserCommandRepository: NewableRepository<B>,
        ChannelQueryRepository: NewableRepository<C>,
        ChannelCommandRepository: NewableRepository<D>,
        ChannelGroupQueryRepository: NewableRepository<E>,
        ChannelGroupCommandRepository: NewableRepository<F>,
        MessageQueryRepository: NewableRepository<G>,
        MessageCommandRepository: NewableRepository<H>,
        ChannelGroupTimelineQueryRepository: NewableRepository<I>,
        ChannelGroupTimelineCommandRepository: NewableRepository<J>,
        TransactionRepository: NewableTransaction
    ) {
        const trustLevel = UserEntity.getInitialTrustLevel({
            signedUpWithTwitter: false,
            invitedByAuthorizedUser: true,
            twitterAccountCreatedAt: null,
        })

        const transaction = await TransactionRepository.new()
        const [user, channelGroup, channel, message1, message2] = await transaction.$transaction(
            async (transactionSession) => {
                const user = new UserEntity({
                    id: -1,
                    name: generateRandomName(config.user.name.max_length),
                    registrationIpAddress: generateRandomIpAddress(),
                    trustLevel: trustLevel,
                })
                user.id = await new UserCommandRepository(transactionSession).add(user)

                const channelGroup = new ChannelGroupEntity({
                    id: -1,
                    name: "channel_group",
                    uniqueName: ChannelGroupEntity.generateUniqueName(),
                    parentId: -1,
                    createdBy: user.id,
                    level: 0,
                    createdAt: new Date(),
                })
                channelGroup.id = await new ChannelGroupCommandRepository(transactionSession).add(channelGroup)
                const channel = new ChannelEntity({
                    id: -1,
                    name: "channel",
                    uniqueName: ChannelEntity.generateUniqueName(),
                    parentChannelGroupId: channelGroup.id,
                    createdBy: user.id,
                    createdAt: new Date(),
                })
                channel.id = await new ChannelCommandRepository(transactionSession).add(channel)

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
                    userId: user.id,
                    channelId: channel.id,
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
                    userId: user.id,
                    channelId: channel.id,
                })
                return [user, channelGroup, channel, message1, message2]
            }
        )
        expect(message1).toBeInstanceOf(MessageEntity)
        expect(message2).toBeInstanceOf(MessageEntity)
        {
            const messageIds = await new ChannelGroupTimelineQueryRepository().listMessageId({
                channelGroupId: channelGroup.id,
                sortBy: "CreatedAt",
                sortOrder: "Ascending",
                limit: 50,
            })
            expect(messageIds[0]).toBe(message1.id)
            expect(messageIds[1]).toBe(message2.id)
        }

        await new ChannelGroupTimelineCommandRepository().delete(message1)
        await new ChannelGroupTimelineCommandRepository().delete(message2)

        {
            const messageIds = await new ChannelGroupTimelineQueryRepository().listMessageId({
                channelGroupId: channelGroup.id,
                sortBy: "CreatedAt",
                sortOrder: "Ascending",
                limit: 50,
            })
            expect(messageIds).toHaveLength(0)
        }

        await new UserCommandRepository().delete(user)
        await new ChannelGroupCommandRepository().delete(channelGroup)
        await new ChannelCommandRepository().delete(channel)
        await new MessageCommandRepository().delete(message2)
        await new MessageCommandRepository().delete(message1)
    }
}
