import { CreateChannelGroupApplication, ErrorCodes } from "../../../../src/application/channel_group/CreateChannelGroup"
import { generateRandomIpAddress, generateRandomName } from "../../functions"

import { ApplicationError } from "../../../../src/application/ApplicationError"
import { ChannelGroupEntity } from "../../../../src/domain/entity/ChannelGroup"
import { ChannelQueryRepository } from "../../../../src/web/repositories"
import { IChannelGroupCommandRepository } from "../../../../src/domain/repository/command/ChannelGroup"
import { IChannelGroupQueryRepository } from "../../../../src/domain/repository/query/ChannelGroup"
import { IUserCommandRepository } from "../../../../src/domain/repository/command/User"
import { IUserQueryRepository } from "../../../../src/domain/repository/query/User"
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

export class CreateChannelGroupApplicationTests {
    constructor() {}
    async testNormal<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelGroupQueryRepository,
        V extends IChannelGroupCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelGroupQueryRepository: NewableRepository<U>,
        ChannelGroupCommandRepository: NewableRepository<V>
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

        const channelGroup = await new CreateChannelGroupApplication(
            new UserQueryRepository(),
            new ChannelGroupQueryRepository(),
            new ChannelGroupCommandRepository()
        ).create({
            name: generateRandomName(config.channel_group.name.max_length),
            parentId: parentChannelGroup.id,
            createdBy: user.id,
        })
        expect(channelGroup).toBeInstanceOf(ChannelGroupEntity)

        await new UserCommandRepository().delete(user)
        await new ChannelGroupCommandRepository().delete(parentChannelGroup)
        await new ChannelGroupCommandRepository().delete(channelGroup)
    }
    async testVisitor<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends IChannelGroupQueryRepository,
        V extends IChannelGroupCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelGroupQueryRepository: NewableRepository<U>,
        ChannelGroupCommandRepository: NewableRepository<V>
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
            await new CreateChannelGroupApplication(
                new UserQueryRepository(),
                new ChannelGroupQueryRepository(),
                new ChannelGroupCommandRepository()
            ).create({
                name: generateRandomName(config.channel_group.name.max_length),
                parentId: parentChannelGroup.id,
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
        U extends IChannelGroupQueryRepository,
        V extends IChannelGroupCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        ChannelGroupQueryRepository: NewableRepository<U>,
        ChannelGroupCommandRepository: NewableRepository<V>,
        TransactionRepository: NewableTransaction
    ) {
        const transaction = await TransactionRepository.new()
        const userName = generateRandomName(config.user.name.max_length)
        const parentUniqueName = generateRandomName(config.channel_group.unique_name.max_length)
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

                const channelGroup = await new CreateChannelGroupApplication(
                    new UserQueryRepository(transactionSession),
                    new ChannelGroupQueryRepository(transactionSession),
                    new ChannelGroupCommandRepository(transactionSession)
                ).create({
                    name: generateRandomName(config.channel_group.unique_name.max_length),
                    parentId: parentChannelGroup.id,
                    createdBy: user.id,
                })
                throw new Error()
                return channelGroup
            })
        } catch (error) {}
        const user = await new UserQueryRepository().findByName(userName)
        expect(user).toBeNull()
        const channelGroup = await new ChannelQueryRepository().findByUniqueName(parentUniqueName)
        expect(channelGroup).toBeNull()
    }
}
