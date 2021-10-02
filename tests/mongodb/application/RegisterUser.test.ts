import {
    ErrorCodes,
    RegisterPasswordBasedUserApplication,
} from "../../../application/registration/RegisterPasswordBasedUser"
import { LoginCredentialsQueryRepository, TransactionRepository } from "../../../web/repositories"

import { ApplicationError } from "../../../application/ApplicationError"
import { LoginCredentialEntity } from "../../../domain/entity/LoginCredential"
import { LoginCredentialsCommandRepository } from "../../../infrastructure/mongodb/repository/command/LoginCredentials"
import { RepositoryError } from "../../../domain/repository/RepositoryError"
import { UserEntity } from "../../../domain/entity/User"
import { UsersCommandRepository } from "../../../infrastructure/mongodb/repository/command/Users"
import { UsersQueryRepository } from "../../../infrastructure/mongodb/repository/query/Users"
import config from "../../../config/app"
import { db } from "../../env"
import { sleep } from "../../functions"

jest.setTimeout(60000)

describe("RegisterUserApplication", () => {
    beforeAll(async () => {
        await db.connect()
    })
    afterAll(async () => {
        await db.disconnect()
    })
    test("Normal", async () => {
        const repeat = 100
        const userNames: string[] = []
        expect.assertions(3 * repeat)
        for (let k = 0; k < repeat; k++) {
            const transaction = await TransactionRepository.new()
            const app = new RegisterPasswordBasedUserApplication(
                new UsersQueryRepository(transaction),
                new UsersCommandRepository(transaction),
                new LoginCredentialsQueryRepository(transaction)
            )
            const name = `admin_${k}`
            await transaction.begin()
            const [user, loginCredential] = await app.register({
                name,
                password: "password",
                ipAddress: `192.168.1.${k}`,
                lastLocation: null,
                device: null,
            })
            expect(user).toBeInstanceOf(UserEntity)
            expect(loginCredential).toBeInstanceOf(LoginCredentialEntity)
            await transaction.commit()
            await transaction.end()
            userNames.push(name)
        }
        for (const name of userNames) {
            const usersQueryRepository = new UsersQueryRepository()
            const usersCommandRepository = new UsersCommandRepository()
            const _user = await usersQueryRepository.findByName(name)
            expect(_user).not.toBeNull()
            if (_user) {
                await usersCommandRepository.delete(_user)
            }
        }
    })
    test("NameTaken", async () => {
        expect.assertions(2)
        const transaction = await TransactionRepository.new()
        await transaction.begin()
        const app = new RegisterPasswordBasedUserApplication(
            new UsersQueryRepository(transaction),
            new UsersCommandRepository(transaction),
            new LoginCredentialsQueryRepository(transaction)
        )
        const name = "admin"
        await app.register({
            name,
            password: "password",
            ipAddress: "192.168.1.1",
            lastLocation: null,
            device: null,
        })
        try {
            await app.register({
                name,
                password: "password",
                ipAddress: "192.168.1.2",
                lastLocation: null,
                device: null,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.NameTaken)
            }
        }
        await transaction.rollback()
        await transaction.end()
    })
    test("TooManyRequests", async () => {
        expect.assertions(2)
        const transaction = await TransactionRepository.new()
        const origValue = config.user_registration.limit
        config.user_registration.limit = 5
        await transaction.begin()
        const app = new RegisterPasswordBasedUserApplication(
            new UsersQueryRepository(transaction),
            new UsersCommandRepository(transaction),
            new LoginCredentialsQueryRepository(transaction)
        )
        const name = "admin"
        await app.register({
            name,
            password: "password",
            ipAddress: "192.168.1.1",
            lastLocation: null,
            device: null,
        })
        const name2 = "fuga"
        try {
            await app.register({
                name: name2,
                password: "password",
                ipAddress: "192.168.1.1",
                lastLocation: null,
                device: null,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.TooManyRequests)
            }
        }
        await sleep(config.user_registration.limit + 1)
        await app.register({
            name: name2,
            password: "password",
            ipAddress: "192.168.1.1",
            lastLocation: null,
            device: null,
        })
        await transaction.rollback()
        await transaction.end()
        config.user_registration.limit = origValue
    })
    test("UserNameNotMeetPolicy", async () => {
        expect.assertions(2)
        const transaction = await TransactionRepository.new()
        await transaction.begin()
        const app = new RegisterPasswordBasedUserApplication(
            new UsersQueryRepository(transaction),
            new UsersCommandRepository(transaction),
            new LoginCredentialsQueryRepository(transaction)
        )
        try {
            await app.register({
                name: "admin-1234",
                password: "password",
                ipAddress: "192.168.1.1",
                lastLocation: null,
                device: null,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.UserNameNotMeetPolicy)
            }
        }
        await transaction.rollback()
        await transaction.end()
    })
    test("PasswordNotMeetPolicy", async () => {
        expect.assertions(2)
        const transaction = await TransactionRepository.new()
        await transaction.begin()
        const app = new RegisterPasswordBasedUserApplication(
            new UsersQueryRepository(transaction),
            new UsersCommandRepository(transaction),
            new LoginCredentialsQueryRepository(transaction)
        )
        try {
            await app.register({
                name: "admin",
                password: "",
                ipAddress: "192.168.1.1",
                lastLocation: null,
                device: null,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.PasswordNotMeetPolicy)
            }
        }
        await transaction.rollback()
        await transaction.end()
    })
    test("Transaction", async () => {
        expect.assertions(3)

        class TestLoginCredentialsRepository extends LoginCredentialsCommandRepository {
            async add(credential: LoginCredentialEntity): Promise<boolean> {
                throw new RepositoryError("")
            }
        }
        const transaction = await TransactionRepository.new()
        const app = new RegisterPasswordBasedUserApplication(
            new UsersQueryRepository(transaction),
            new UsersCommandRepository(transaction),
            new TestLoginCredentialsRepository(transaction)
        )
        const name = "admin"
        try {
            await transaction.begin()
            await app.register({
                name: name,
                password: "password",
                ipAddress: "192.168.1.1",
                lastLocation: null,
                device: null,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.InternalError)
            }
        }
        await transaction.rollback()
        await transaction.end()
        {
            const usersRepository = new UsersQueryRepository()
            const user = await usersRepository.findByName(name)
            expect(user).toBeNull()
        }
    })
})
