import signup, { expectedErrorSpecs } from "../../../../../src/web/api/methods/account/signup_without_name"

import { DeleteUserApplication } from "../../../../../src/application/registration/DeleteUser"
import { LoginCredentialCommandRepository } from "../../../../../src/infrastructure/prisma/repository/command/LoginCredential"
import { LoginCredentialQueryRepository } from "../../../../../src/infrastructure/prisma/repository/query/LoginCredential"
import { LoginSessionCommandRepository } from "../../../../../src/infrastructure/prisma/repository/command/LoginSession"
import { LoginSessionQueryRepository } from "../../../../../src/infrastructure/prisma/repository/query/LoginSession"
import { UserCommandRepository } from "../../../../../src/infrastructure/prisma/repository/command/User"
import { UserEntity } from "../../../../../src/domain/entity/User"
import { UserQueryRepository } from "../../../../../src/infrastructure/prisma/repository/query/User"
import { WebApiRuntimeError } from "../../../../../src/web/api/error"
import config from "../../../../../src/config/app"
import { sleep } from "../../../functions"

jest.setTimeout(60000)

describe("account/signup_without_name", () => {
    test("Normal", async () => {
        const origValue = config.user_registration.limit
        config.user_registration.limit = 5
        expect.assertions(4)
        try {
            await signup(
                {
                    password: "password",
                    confirmation_password: "hoge",
                    ip_address: "192.168.1.1",
                },
                "192.168.1.1",
                null
            )
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toBe(expectedErrorSpecs["confirmation_password_not_match"].code)
            }
        }
        const [user1] = await signup(
            {
                password: "password",
                confirmation_password: "password",
                ip_address: "192.168.1.1",
            },
            "192.168.1.1",
            null
        )
        expect(user1).toBeInstanceOf(UserEntity)
        await sleep(config.user_registration.limit + 1)
        const [user2] = await signup(
            {
                password: "password",
                confirmation_password: "password",
                ip_address: "192.168.1.1",
            },
            "192.168.1.1",
            null
        )
        expect(user2).toBeInstanceOf(UserEntity)
        if (user1) {
            await new DeleteUserApplication(
                new UserQueryRepository(),
                new UserCommandRepository(),
                new LoginCredentialQueryRepository(),
                new LoginCredentialCommandRepository(),
                new LoginSessionQueryRepository(),
                new LoginSessionCommandRepository()
            ).delete(user1.id)
        }
        if (user2) {
            await new DeleteUserApplication(
                new UserQueryRepository(),
                new UserCommandRepository(),
                new LoginCredentialQueryRepository(),
                new LoginCredentialCommandRepository(),
                new LoginSessionQueryRepository(),
                new LoginSessionCommandRepository()
            ).delete(user2.id)
        }
        config.user_registration.limit = origValue
    })
    test("TooManyRequests", async () => {
        expect.assertions(5)
        try {
            await signup(
                {
                    password: "password",
                    confirmation_password: "hoge",
                    ip_address: "192.168.1.1",
                },
                "192.168.1.1",
                null
            )
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toBe(expectedErrorSpecs["confirmation_password_not_match"].code)
            }
        }
        const [user1] = await signup(
            {
                password: "password",
                confirmation_password: "password",
                ip_address: "192.168.1.1",
            },
            "192.168.1.1",
            null
        )
        expect(user1).toBeInstanceOf(UserEntity)
        try {
            await signup(
                {
                    password: "password",
                    confirmation_password: "password",
                    ip_address: "192.168.1.1",
                },
                "192.168.1.1",
                null
            )
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toBe(expectedErrorSpecs["too_many_requests"].code)
            }
        }
        if (user1) {
            await new DeleteUserApplication(
                new UserQueryRepository(),
                new UserCommandRepository(),
                new LoginCredentialQueryRepository(),
                new LoginCredentialCommandRepository(),
                new LoginSessionQueryRepository(),
                new LoginSessionCommandRepository()
            ).delete(user1.id)
        }
    })
})
