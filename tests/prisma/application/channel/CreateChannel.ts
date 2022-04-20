import { CreateChannelApplication, ErrorCodes } from "../../../../application/channel/CreateChannel"
import { generateRandomIpAddress, generateRandomName } from "../../functions"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ChannelEntity } from "../../../../domain/entity/Channel"
import { ChannelGroupEntity } from "../../../../domain/entity/ChannelGroup"
import { IChannelCommandRepository } from "../../../../domain/repository/command/Channel"
import { IChannelGroupCommandRepository } from "../../../../domain/repository/command/ChannelGroup"
import { IChannelGroupQueryRepository } from "../../../../domain/repository/query/ChannelGroup"
import { IChannelQueryRepository } from "../../../../domain/repository/query/Channel"
import { IUserCommandRepository } from "../../../../domain/repository/command/User"
import { IUserQueryRepository } from "../../../../domain/repository/query/User"
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

export class CreateChannelApplicationTests {
    constructor() {}
    async testNormal<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelCommandRepository,
        V extends IChannelGroupQueryRepository,
        W extends IChannelGroupCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelCommandRepository: NewableRepository<U>,
        ChannelGroupQueryRepository: NewableRepository<V>,
        ChannelGroupCommandRepository: NewableRepository<W>
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

        const parentChannelGroup = new ChannelGroupEntity({
            id: -1,
            name: generateRandomName(config.channel_group.name.max_length),
            uniqueName: generateRandomName(config.channel_group.unique_name.max_length),
            parentId: 3,
            level: 1,
            createdBy: user.id,
            createdAt: new Date(),
        })
        parentChannelGroup.id = await new ChannelGroupCommandRepository().add(parentChannelGroup)

        const channel = await new CreateChannelApplication(
            new UserQueryRepository(),
            new ChannelGroupQueryRepository(),
            new ChannelCommandRepository()
        ).create({
            name: generateRandomName(config.channel_group.name.max_length),
            parentChannelGroupId: parentChannelGroup.id,
            createdBy: user.id,
        })
        expect(channel).toBeInstanceOf(ChannelEntity)

        await new UserCommandRepository().delete(user)
        await new ChannelGroupCommandRepository().delete(parentChannelGroup)
        await new ChannelCommandRepository().delete(channel)
    }
    async testVisitor<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelCommandRepository,
        V extends IChannelGroupQueryRepository,
        W extends IChannelGroupCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelCommandRepository: NewableRepository<U>,
        ChannelGroupQueryRepository: NewableRepository<V>,
        ChannelGroupCommandRepository: NewableRepository<W>
    ) {
        expect.assertions(2)
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

        const parentChannelGroup = new ChannelGroupEntity({
            id: -1,
            name: generateRandomName(config.channel_group.name.max_length),
            uniqueName: generateRandomName(config.channel_group.unique_name.max_length),
            parentId: 3,
            level: 1,
            createdBy: user.id,
            createdAt: new Date(),
        })
        parentChannelGroup.id = await new ChannelGroupCommandRepository().add(parentChannelGroup)
        try {
            await new CreateChannelApplication(
                new UserQueryRepository(),
                new ChannelGroupQueryRepository(),
                new ChannelCommandRepository()
            ).create({
                name: generateRandomName(config.channel_group.name.max_length),
                parentChannelGroupId: parentChannelGroup.id,
                createdBy: user.id,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.DoNotHavePermission)
            }
        }

        await new UserCommandRepository().delete(user)
        await new ChannelGroupCommandRepository().delete(parentChannelGroup)
    }
    async testTransaction<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelQueryRepository,
        V extends IChannelCommandRepository,
        W extends IChannelGroupQueryRepository,
        X extends IChannelGroupCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelQueryRepository: NewableRepository<U>,
        ChannelCommandRepository: NewableRepository<V>,
        ChannelGroupQueryRepository: NewableRepository<W>,
        ChannelGroupCommandRepository: NewableRepository<X>,
        TransactionRepository: NewableTransaction
    ) {
        const transaction = await TransactionRepository.new()
        const userName = generateRandomName(config.user.name.max_length)
        const parentUniqueName = generateRandomName(config.channel_group.unique_name.max_length)
        const uniqueName = generateRandomName(config.channel_group.unique_name.max_length)
        try {
            await transaction.$transaction(async (transactionSession) => {
                const trustLevel = UserEntity.getInitialTrustLevel({
                    signedUpWithTwitter: false,
                    invitedByAuthorizedUser: true,
                    twitterAccountCreatedAt: null,
                })
                const user = new UserEntity({
                    id: -1,
                    name: userName,
                    registrationIpAddress: generateRandomIpAddress(),
                    trustLevel: trustLevel,
                })
                user.id = await new UserCommandRepository(transactionSession).add(user)
                const parentChannelGroup = new ChannelGroupEntity({
                    id: -1,
                    name: generateRandomName(config.channel_group.name.max_length),
                    uniqueName: parentUniqueName,
                    parentId: 3,
                    level: 1,
                    createdBy: user.id,
                    createdAt: new Date(),
                })
                parentChannelGroup.id = await new ChannelGroupCommandRepository(transactionSession).add(
                    parentChannelGroup
                )

                const channel = await new CreateChannelApplication(
                    new UserQueryRepository(transactionSession),
                    new ChannelGroupQueryRepository(transactionSession),
                    new ChannelCommandRepository(transactionSession)
                ).create({
                    name: uniqueName,
                    parentChannelGroupId: parentChannelGroup.id,
                    createdBy: user.id,
                })
                throw new Error()
                return channel
            })
        } catch (error) {}
        const user = await new UserQueryRepository().findByName(userName)
        expect(user).toBeNull()
        const channelGroup = await new ChannelGroupQueryRepository().findByUniqueName(parentUniqueName)
        expect(channelGroup).toBeNull()
        const channel = await new ChannelQueryRepository().findByUniqueName(uniqueName)
        expect(channel).toBeNull()
    }
}
