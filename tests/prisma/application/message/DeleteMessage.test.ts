import * as repo from "../../../../infrastructure/prisma/repository"

import { DeleteMessageApplicationTests } from "./DeleteMessage"

jest.setTimeout(60000)

describe("DeleteMessageApplication", () => {
    const testing = new DeleteMessageApplicationTests()
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
    test("Risky user", async () => {
        await testing.testRiskyUser(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelQueryRepository,
            repo.ChannelCommandRepository,
            repo.MessageQueryRepository,
            repo.MessageCommandRepository,
            repo.TransactionRepository
        )
    })
    test("Other user", async () => {
        await testing.testOtherUser(
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
