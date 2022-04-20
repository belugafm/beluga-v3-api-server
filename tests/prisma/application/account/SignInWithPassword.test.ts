import * as repo from "../../../../infrastructure/prisma/repository"

import { SignInWithPasswordAplicationTests } from "./SignInWithPassword"

jest.setTimeout(60000)

describe("RegisterUserApplication", () => {
    const testing = new SignInWithPasswordAplicationTests()
    test("Normal", async () => {
        await testing.testNormal(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialQueryRepository,
            repo.LoginCredentialCommandRepository,
            repo.LoginSessionCommandRepository,
            repo.AuthenticityTokenCommandRepository
        )
    })
    test("IncorrectPassword", async () => {
        await testing.testIncorrectPassword(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialQueryRepository,
            repo.LoginCredentialCommandRepository,
            repo.LoginSessionCommandRepository,
            repo.AuthenticityTokenCommandRepository
        )
    })
    test("Transaction", async () => {
        await testing.testTransaction(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.LoginCredentialQueryRepository,
            repo.LoginCredentialCommandRepository,
            repo.LoginSessionCommandRepository,
            repo.AuthenticityTokenCommandRepository,
            repo.TransactionRepository
        )
    })
})
