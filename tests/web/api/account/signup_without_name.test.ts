import signup, {
    expectedErrorSpecs,
    generateRandomName,
} from "../../../../web/api/methods/account/signup_without_name"

import { DeleteUserApplication } from "../../../../application/DeleteUser"
import { LoginCredentialsCommandRepository } from "../../../../infrastructure/mongodb/repository/command/LoginCredentials"
import { LoginCredentialsQueryRepository } from "../../../../infrastructure/mongodb/repository/query/LoginCredentials"
import { LoginSessionsCommandRepository } from "../../../../infrastructure/mongodb/repository/command/LoginSessions"
import { LoginSessionsQueryRepository } from "../../../../infrastructure/mongodb/repository/query/LoginSessions"
import { UserEntity } from "../../../../domain/entity/User"
import { UsersCommandRepository } from "../../../../infrastructure/mongodb/repository/command/Users"
import { UsersQueryRepository } from "../../../../infrastructure/mongodb/repository/query/Users"
import { WebApiRuntimeError } from "../../../../web/api/error"
import config from "../../../../config/app"
import { db } from "../../../env"
import { sleep } from "../../../functions"

jest.setTimeout(60000)

describe("account/signup_without_name", () => {
    beforeAll(async () => {
        await db.connect()
    })
    afterAll(async () => {
        await db.disconnect()
    })
    test("generateRandomName", async () => {
        const repeat = 10000
        const pool = new Set()
        const length = (config.user.name.max_length - config.user.name.min_length) / 2
        for (let i = 0; i < repeat; i++) {
            const name = generateRandomName(length)
            pool.add(name)
        }
        expect(pool.size).toBe(repeat)
    })
    test("Normal", async () => {
        const origValue = config.user_registration.limit
        config.user_registration.limit = 5
        expect.assertions(4)
        try {
            await signup(
                {
                    password: "password",
                    confirmationPassword: "hoge",
                    ipAddress: "192.168.1.1",
                    lastLocation: "Tokyo, Japan",
                    device: "Chrome on Linux",
                },
                null
            )
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toBe(expectedErrorSpecs["confirmation_password_not_match"].code)
            }
        }
        const user1 = await signup(
            {
                password: "password",
                confirmationPassword: "password",
                ipAddress: "192.168.1.1",
                lastLocation: "Tokyo, Japan",
                device: "Chrome on Linux",
            },
            null
        )
        expect(user1).toBeInstanceOf(UserEntity)
        await sleep(config.user_registration.limit + 1)

        const user2 = await signup(
            {
                password: "password",
                confirmationPassword: "password",
                ipAddress: "192.168.1.1",
                lastLocation: "Tokyo, Japan",
                device: "Chrome on Linux",
            },
            null
        )
        expect(user2).toBeInstanceOf(UserEntity)
        if (user1) {
            await new DeleteUserApplication(
                new UsersQueryRepository(),
                new UsersCommandRepository(),
                new LoginCredentialsQueryRepository(),
                new LoginCredentialsCommandRepository(),
                new LoginSessionsQueryRepository(),
                new LoginSessionsCommandRepository()
            ).delete(user1.id)
        }
        if (user2) {
            await new DeleteUserApplication(
                new UsersQueryRepository(),
                new UsersCommandRepository(),
                new LoginCredentialsQueryRepository(),
                new LoginCredentialsCommandRepository(),
                new LoginSessionsQueryRepository(),
                new LoginSessionsCommandRepository()
            ).delete(user2.id)
        }
        config.user_registration.limit = origValue
    })
})
