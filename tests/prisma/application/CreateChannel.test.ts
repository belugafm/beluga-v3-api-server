import * as repo from "../../../infrastructure/prisma/repository"

import { CreateChannelApplicationTests } from "./CreateChannel"

jest.setTimeout(60000)

describe("CreateChannelApplication", () => {
    const testing = new CreateChannelApplicationTests()
    test("Normal", async () => {
        await testing.testNormal(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.ChannelGroupCommandRepository
        )
    })
    test("Visitor", async () => {
        await testing.testVisitor(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.ChannelGroupCommandRepository
        )
    })
    test("Transaction", async () => {
        await testing.testTransaction(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelQueryRepository,
            repo.ChannelCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.ChannelGroupCommandRepository,
            repo.TransactionRepository
        )
    })
})
