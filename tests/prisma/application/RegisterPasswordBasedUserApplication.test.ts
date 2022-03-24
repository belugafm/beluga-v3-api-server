import * as repo from "../../../infrastructure/prisma/repository"

import { LoginCredentialEntity } from "../../../domain/entity/LoginCredential"
import { RegisterPasswordBasedUserApplicationTests } from "./RegisterPasswordBasedUserApplication"

jest.setTimeout(60000)

describe("RegisterUserApplication", () => {
    const testing = new RegisterPasswordBasedUserApplicationTests()
    test("Normal", async () => {
        await testing.testNormal(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialCommandRepository,
            repo.TransactionRepository
        )
    })
    test("NameTaken", async () => {
        await testing.testNameTaken(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialCommandRepository,
            repo.TransactionRepository
        )
    })
    test("TooManyRequests", async () => {
        await testing.testTooManyRequests(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialCommandRepository,
            repo.TransactionRepository
        )
    })
    test("UserNameNotMeetPolicy", async () => {
        await testing.testUserNameNotMeetPolicy(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialCommandRepository,
            repo.TransactionRepository
        )
    })
    test("PasswordNotMeetPolicy", async () => {
        await testing.testPasswordNotMeetPolicy(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialCommandRepository,
            repo.TransactionRepository
        )
    })
    test("Transaction", async () => {
        class TestLoginCredentialsRepository extends repo.LoginCredentialCommandRepository {
            async add(credential: LoginCredentialEntity): Promise<boolean> {
                return true
            }
        }
        await testing.testTransaction(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            TestLoginCredentialsRepository,
            repo.TransactionRepository
        )
    })
})
