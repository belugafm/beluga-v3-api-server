import * as repo from "../../../../infrastructure/prisma/repository"

import { PostMessageApplicationTests } from "./PostMessage"

jest.setTimeout(60000)

describe("PostMessageApplication", () => {
    const testing = new PostMessageApplicationTests()
    test("Normal", async () => {
        await testing.testNormal(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelQueryRepository,
            repo.ChannelCommandRepository,
            repo.MessageQueryRepository,
            repo.MessageCommandRepository,
            repo.TransactionRepository
        )
    })
    test("Rate limit", async () => {
        await testing.testVisitorRateLimittingFailureCase(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelQueryRepository,
            repo.ChannelCommandRepository,
            repo.MessageQueryRepository,
            repo.MessageCommandRepository,
            repo.TransactionRepository
        )
    })
    test("Rate limit", async () => {
        await testing.testVisitorRateLimittingSuccessfulCase(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelQueryRepository,
            repo.ChannelCommandRepository,
            repo.MessageQueryRepository,
            repo.MessageCommandRepository,
            repo.TransactionRepository
        )
    })
})
