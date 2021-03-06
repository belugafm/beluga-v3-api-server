import { generateRandomIpAddress, generateRandomName } from "../../functions"

import { UserCommandRepository } from "../../../../src/infrastructure/prisma/repository/command/User"
import { UserEntity } from "../../../../src/domain/entity/User"
import { UserId } from "../../../../src/domain/types"
import config from "../../../../src/config/app"

jest.setTimeout(30000)

describe("UsersRepository", () => {
    test("emitChanges", async () => {
        expect.assertions(4)
        const repo1 = new UserCommandRepository()
        const repo2 = new UserCommandRepository()

        const user = new UserEntity({
            id: -1,
            name: generateRandomName(config.user.name.max_length),
            registrationIpAddress: generateRandomIpAddress(),
        })
        user.id = await repo1.add(user)
        UserCommandRepository.subscribe((userId: UserId) => {
            expect(userId).toBe(user.id)
        })

        user.name = generateRandomName(config.user.name.max_length)
        const updated = await repo2.update(user)
        expect(updated).toBeTruthy()
        const succeeded = await repo2.delete(user)
        expect(succeeded).toBeTruthy()
        UserCommandRepository.deleteAllEventHandlers()
    })
    test("emitChanges", async () => {
        expect.assertions(2)
        const repo1 = new UserCommandRepository()
        const repo2 = new UserCommandRepository()

        const user = new UserEntity({
            id: -1,
            name: generateRandomName(config.user.name.max_length),
            registrationIpAddress: generateRandomIpAddress(),
        })
        user.id = await repo1.add(user)
        UserCommandRepository.subscribe((userId: UserId) => {
            expect(userId).toBe(user.id)
        })
        await repo2.update(user) // no effect
        const succeeded = await repo2.delete(user)
        expect(succeeded).toBeTruthy()
        UserCommandRepository.deleteAllEventHandlers()
    })
})
