import * as mongodb_repositories from "../../infrastructure/mongodb/repository/"

import { LoginCredentialEntity } from "../../domain/entity/LoginCredential"
import { RegisterUserTests } from "./RegisterUser"
import { RepositoryError } from "../../domain/repository/RepositoryError"
import { db } from "../env"

jest.setTimeout(60000)

describe("RegisterUserApplication", () => {
    const testing = new RegisterUserTests()
    beforeAll(async () => {
        await db.connect()
    })
    afterAll(async () => {
        await db.disconnect()
    })
    test("Normal", async () => {
        await testing.testNormal(
            mongodb_repositories.UsersQueryRepository,
            mongodb_repositories.UsersCommandRepository,
            mongodb_repositories.LoginCredentialsCommandRepository,
            mongodb_repositories.TransactionRepository
        )
    })
    test("NameTaken", async () => {
        await testing.testNameTaken(
            mongodb_repositories.UsersQueryRepository,
            mongodb_repositories.UsersCommandRepository,
            mongodb_repositories.LoginCredentialsCommandRepository,
            mongodb_repositories.TransactionRepository
        )
    })
    test("TooManyRequests", async () => {
        await testing.testTooManyRequests(
            mongodb_repositories.UsersQueryRepository,
            mongodb_repositories.UsersCommandRepository,
            mongodb_repositories.LoginCredentialsCommandRepository,
            mongodb_repositories.TransactionRepository
        )
    })
    test("UserNameNotMeetPolicy", async () => {
        await testing.testUserNameNotMeetPolicy(
            mongodb_repositories.UsersQueryRepository,
            mongodb_repositories.UsersCommandRepository,
            mongodb_repositories.LoginCredentialsCommandRepository,
            mongodb_repositories.TransactionRepository
        )
    })
    test("PasswordNotMeetPolicy", async () => {
        await testing.testPasswordNotMeetPolicy(
            mongodb_repositories.UsersQueryRepository,
            mongodb_repositories.UsersCommandRepository,
            mongodb_repositories.LoginCredentialsCommandRepository,
            mongodb_repositories.TransactionRepository
        )
    })
    test("Transaction", async () => {
        class TestLoginCredentialsRepository extends mongodb_repositories.LoginCredentialsCommandRepository {
            async add(credential: LoginCredentialEntity): Promise<boolean> {
                throw new RepositoryError("")
            }
        }
        await testing.testTransaction(
            mongodb_repositories.UsersQueryRepository,
            mongodb_repositories.UsersCommandRepository,
            TestLoginCredentialsRepository,
            mongodb_repositories.TransactionRepository
        )
    })
})
