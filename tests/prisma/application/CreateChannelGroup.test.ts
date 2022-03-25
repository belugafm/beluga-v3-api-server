import * as repo from "../../../infrastructure/prisma/repository"

import { CreateChannelGroupApplicationTests } from "./CreateChannelGroup"

jest.setTimeout(60000)

describe("RegisterUserApplication", () => {
    const testing = new CreateChannelGroupApplicationTests()
    test("Normal", async () => {
        await testing.testNormal(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.ChannelGroupCommandRepository
        )
    })
    test("Visitor", async () => {
        await testing.testVisitor(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.ChannelGroupCommandRepository
        )
    })
    test("Transaction", async () => {
        await testing.testTransaction(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.ChannelGroupCommandRepository,
            repo.TransactionRepository
        )
    })
})
