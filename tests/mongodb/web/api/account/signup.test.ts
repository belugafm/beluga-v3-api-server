import signup, { expectedErrorSpecs } from "../../../../../web/api/methods/account/signup"

import { DeleteUserApplication } from "../../../../../application/DeleteUser"
import { LoginCredentialsCommandRepository } from "../../../../../infrastructure/mongodb/repository/command/LoginCredentials"
import { LoginCredentialsQueryRepository } from "../../../../../infrastructure/mongodb/repository/query/LoginCredentials"
import { LoginSessionsCommandRepository } from "../../../../../infrastructure/mongodb/repository/command/LoginSessions"
import { LoginSessionsQueryRepository } from "../../../../../infrastructure/mongodb/repository/query/LoginSessions"
import { UsersCommandRepository } from "../../../../../infrastructure/mongodb/repository/command/Users"
import { UsersQueryRepository } from "../../../../../infrastructure/mongodb/repository/query/Users"
import { WebApiRuntimeError } from "../../../../../web/api/error"
import { db } from "../../../../env"

jest.setTimeout(60000)

describe("account/signup", () => {
    beforeAll(async () => {
        await db.connect()
    })
    afterAll(async () => {
        await db.disconnect()
    })
    test("Normal", async () => {
        expect.assertions(10)
        const name = "admin"
        try {
            await signup(
                {
                    name: name,
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
        try {
            await signup(
                {
                    name: "",
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
                expect(error.code).toBe(expectedErrorSpecs["user_name_not_meet_policy"].code)
            }
        }
        const user = await signup(
            {
                name: name,
                password: "password",
                confirmationPassword: "password",
                ipAddress: "192.168.1.1",
                lastLocation: "Tokyo, Japan",
                device: "Chrome on Linux",
            },
            null
        )
        expect(user).not.toBeNull()
        try {
            await signup(
                {
                    name: name,
                    password: "password",
                    confirmationPassword: "password",
                    ipAddress: "192.168.1.1",
                    lastLocation: "Tokyo, Japan",
                    device: "Chrome on Linux",
                },
                null
            )
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toBe(expectedErrorSpecs["too_many_requests"].code)
            }
        }
        try {
            await signup(
                {
                    name: name,
                    password: "password",
                    confirmationPassword: "password",
                    ipAddress: "192.168.1.2",
                    lastLocation: "Tokyo, Japan",
                    device: "Chrome on Linux",
                },
                null
            )
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toBe(expectedErrorSpecs["user_name_taken"].code)
            }
        }
        if (user) {
            await new DeleteUserApplication(
                new UsersQueryRepository(),
                new UsersCommandRepository(),
                new LoginCredentialsQueryRepository(),
                new LoginCredentialsCommandRepository(),
                new LoginSessionsQueryRepository(),
                new LoginSessionsCommandRepository()
            ).delete(user.id)
        }
        {
            const usersRepository = new UsersQueryRepository()
            const user = await usersRepository.findByName(name)
            expect(user).toBeNull()
        }
    })
})
