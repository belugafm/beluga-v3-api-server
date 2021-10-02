import * as uuid from "uuid"

import { LoginSessionsCommandRepository } from "../../../../infrastructure/mongodb/repository/command/LoginSessions"
import { RepositoryError } from "../../../../domain/repository/RepositoryError"
import { UserEntity } from "../../../../domain/entity/User"
import { UserId } from "../../../../domain/types"
import { UsersCommandRepository } from "../../../../infrastructure/mongodb/repository/command/Users"
import { UsersQueryRepository } from "../../../../infrastructure/mongodb/repository/query/Users"
import config from "../../../../config/app"
import { db } from "../../../mongodb"
import { sleep } from "../../../env"

jest.setTimeout(30000)

describe("UsersRepository", () => {
    beforeAll(async () => {
        await db.connect()
    })
    afterAll(async () => {
        await db.disconnect()
    })
    test("Normal", async () => {
        const queryRepository = new UsersQueryRepository()
        const commandRepository = new UsersCommandRepository()
        const user = new UserEntity({ id: -1, name: "hoge", registrationIpAddress: "192.168.1.1" })
        user.twitterUserId = uuid.v4()
        user.displayName = uuid.v4().substr(0, config.user.display_name.max_length)
        user.description = uuid.v4()
        user.location = uuid.v4().substr(0, config.user.location.max_length)
        user.profileImageUrl = `https://example.com/${uuid.v4()}.png`
        user.backgroundImageUrl = `https://example.com/${uuid.v4()}.png`
        user.url = `https://example.com/${uuid.v4()}`
        user.themeColor = "#01ab9f"
        user.defaultProfile = false
        user.statusCount = 10
        user.favoritesCount = 11
        user.favoritedCount = 12
        user.likesCount = 13
        user.likedCount = 14
        user.channelsCount = 15
        user.followingChannelsCount = 16
        user.active = true
        user.dormant = true
        user.suspended = true
        user.trustLevel = 99
        user.lastActivityDate = new Date()
        await sleep(1)
        user.termsOfServiceAgreementDate = new Date()
        user.termsOfServiceAgreementVersion = uuid.v4()

        {
            const _user = await queryRepository.findByName(user.name)
            expect(_user).toBeNull()
        }

        const userId = await commandRepository.add(user)
        expect(typeof userId).toBe("string")
        user.id = userId

        {
            const _user = await queryRepository.findById(user.id as string)
            expect(_user).not.toBeNull()
            expect(_user?.id).toBe(user.id)
            expect(_user?.name).toBe(user.name)
            expect(_user?.twitterUserId).toBe(user.twitterUserId)
            expect(_user?.displayName).toBe(user.displayName)
            expect(_user?.profileImageUrl).toBe(user.profileImageUrl)
            expect(_user?.location).toBe(user.location)
            expect(_user?.url).toBe(user.url)
            expect(_user?.description).toBe(user.description)
            expect(_user?.themeColor).toBe(user.themeColor)
            expect(_user?.backgroundImageUrl).toBe(user.backgroundImageUrl)
            expect(_user?.defaultProfile).toBe(user.defaultProfile)
            expect(_user?.statusCount).toBe(user.statusCount)
            expect(_user?.favoritesCount).toBe(user.favoritesCount)
            expect(_user?.favoritedCount).toBe(user.favoritedCount)
            expect(_user?.likesCount).toBe(user.likesCount)
            expect(_user?.likedCount).toBe(user.likedCount)
            expect(_user?.channelsCount).toBe(user.channelsCount)
            expect(_user?.followingChannelsCount).toBe(user.followingChannelsCount)
            expect(_user?.createdAt).toEqual(user.createdAt)
            expect(_user?.active).toBe(user.active)
            expect(_user?.dormant).toBe(user.dormant)
            expect(_user?.suspended).toBe(user.suspended)
            expect(_user?.trustLevel).toBe(user.trustLevel)
            expect(_user?.lastActivityDate).toEqual(user.lastActivityDate)
            expect(_user?.termsOfServiceAgreementDate).toEqual(user.termsOfServiceAgreementDate)
            expect(_user?.termsOfServiceAgreementVersion).toBe(user.termsOfServiceAgreementVersion)
        }
        {
            const _user = await queryRepository.findByName(user.name)
            expect(_user).not.toBeNull()
            expect(_user?.id).toBe(user.id)
            expect(_user?.name).toBe(user.name)
            expect(_user?.twitterUserId).toBe(user.twitterUserId)
            expect(_user?.displayName).toBe(user.displayName)
            expect(_user?.profileImageUrl).toBe(user.profileImageUrl)
            expect(_user?.location).toBe(user.location)
            expect(_user?.url).toBe(user.url)
            expect(_user?.description).toBe(user.description)
            expect(_user?.themeColor).toBe(user.themeColor)
            expect(_user?.backgroundImageUrl).toBe(user.backgroundImageUrl)
            expect(_user?.defaultProfile).toBe(user.defaultProfile)
            expect(_user?.statusCount).toBe(user.statusCount)
            expect(_user?.favoritesCount).toBe(user.favoritesCount)
            expect(_user?.favoritedCount).toBe(user.favoritedCount)
            expect(_user?.likesCount).toBe(user.likesCount)
            expect(_user?.likedCount).toBe(user.likedCount)
            expect(_user?.channelsCount).toBe(user.channelsCount)
            expect(_user?.followingChannelsCount).toBe(user.followingChannelsCount)
            expect(_user?.createdAt).toEqual(user.createdAt)
            expect(_user?.active).toBe(user.active)
            expect(_user?.dormant).toBe(user.dormant)
            expect(_user?.suspended).toBe(user.suspended)
            expect(_user?.trustLevel).toBe(user.trustLevel)
            expect(_user?.lastActivityDate).toEqual(user.lastActivityDate)
            expect(_user?.termsOfServiceAgreementDate).toEqual(user.termsOfServiceAgreementDate)
            expect(_user?.termsOfServiceAgreementVersion).toBe(user.termsOfServiceAgreementVersion)
        }

        const succeeded = await commandRepository.delete(user)
        expect(succeeded).toBeTruthy()

        {
            const _user = await queryRepository.findById(user.id as string)
            expect(_user).toBeNull()
        }
        {
            const _user = await queryRepository.findByName(user.name)
            expect(_user).toBeNull()
        }
    })
    test("Duplicated name", async () => {
        expect.assertions(2)
        const repository = new UsersCommandRepository()

        const user1 = new UserEntity({ id: 1, name: "hoge", registrationIpAddress: "192.168.1.1" })
        user1.id = await repository.add(user1)

        try {
            const user2 = new UserEntity({
                id: 1,
                name: "hoge",
                registrationIpAddress: "192.168.1.1",
            })
            user2.id = await repository.add(user2)
        } catch (error) {
            expect(error).toBeInstanceOf(RepositoryError)
        }
        const succeeded = await repository.delete(user1)
        expect(succeeded).toBeTruthy()
    })
    test("update", async () => {
        const queryRepository = new UsersQueryRepository()
        const commandRepository = new UsersCommandRepository()

        const user = new UserEntity({ id: 1, name: "hoge", registrationIpAddress: "192.168.1.1" })
        user.id = await commandRepository.add(user)
        user.twitterUserId = uuid.v4()
        user.displayName = uuid.v4().substr(0, config.user.display_name.max_length)
        user.description = uuid.v4()
        user.location = uuid.v4().substr(0, config.user.location.max_length)
        user.profileImageUrl = `https://example.com/${uuid.v4()}.png`
        user.backgroundImageUrl = `https://example.com/${uuid.v4()}.png`
        user.url = `https://example.com/${uuid.v4()}`
        user.themeColor = "#01ab9f"
        user.defaultProfile = false
        user.statusCount = 10
        user.favoritesCount = 11
        user.favoritedCount = 12
        user.likesCount = 13
        user.likedCount = 14
        user.channelsCount = 15
        user.followingChannelsCount = 16
        user.active = true
        user.dormant = true
        user.suspended = true
        user.trustLevel = 111
        user.lastActivityDate = new Date()
        await commandRepository.update(user)
        {
            const _user = await queryRepository.findById(user.id as string)
            expect(_user).not.toBeNull()
            expect(_user?.id).toBe(user.id)
            expect(_user?.name).toBe(user.name)
            expect(_user?.twitterUserId).toBe(user.twitterUserId)
            expect(_user?.displayName).toBe(user.displayName)
            expect(_user?.profileImageUrl).toBe(user.profileImageUrl)
            expect(_user?.location).toBe(user.location)
            expect(_user?.url).toBe(user.url)
            expect(_user?.description).toBe(user.description)
            expect(_user?.themeColor).toBe(user.themeColor)
            expect(_user?.backgroundImageUrl).toBe(user.backgroundImageUrl)
            expect(_user?.defaultProfile).toBe(user.defaultProfile)
            expect(_user?.statusCount).toBe(user.statusCount)
            expect(_user?.favoritesCount).toBe(user.favoritesCount)
            expect(_user?.favoritedCount).toBe(user.favoritedCount)
            expect(_user?.likesCount).toBe(user.likesCount)
            expect(_user?.likedCount).toBe(user.likedCount)
            expect(_user?.channelsCount).toBe(user.channelsCount)
            expect(_user?.followingChannelsCount).toBe(user.followingChannelsCount)
            expect(_user?.createdAt).toEqual(user.createdAt)
            expect(_user?.active).toBe(user.active)
            expect(_user?.dormant).toBe(user.dormant)
            expect(_user?.suspended).toBe(user.suspended)
            expect(_user?.trustLevel).toBe(user.trustLevel)
            expect(_user?.lastActivityDate).toEqual(user.lastActivityDate)
            expect(_user?.termsOfServiceAgreementDate).toEqual(user.termsOfServiceAgreementDate)
            expect(_user?.termsOfServiceAgreementVersion).toBe(user.termsOfServiceAgreementVersion)
        }
        const succeeded = await commandRepository.delete(user)
        expect(succeeded).toBeTruthy()
    })
    test("emitChanges", async () => {
        expect.assertions(3)
        const repository1 = new UsersCommandRepository()
        const repository2 = new UsersCommandRepository()

        const user = new UserEntity({ id: 1, name: "hoge", registrationIpAddress: "192.168.1.1" })
        user.id = await repository1.add(user)
        UsersCommandRepository.subscribe((userId: UserId) => {
            expect(userId).toBe(user.id)
        })
        // @ts-ignore
        expect(LoginSessionsCommandRepository._eventListeners.length).toBe(0)
        LoginSessionsCommandRepository.subscribe((sessionId: string) => {
            expect(sessionId).toBe("") // 正しく実装できていればこの行は実行されない
        })

        await repository1.update(user)
        await repository2.update(user)
        const succeeded = await repository2.delete(user)
        expect(succeeded).toBeTruthy()
    })
})
