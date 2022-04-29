import * as repo from "../../../../src/infrastructure/prisma/repository"

import { ChannelTimelineApplicationTests } from "./Channel"

jest.setTimeout(60000)

describe("ChannelTimelineApplication", () => {
    const testing = new ChannelTimelineApplicationTests()
    test("Normal", async () => {
        await testing.testNormal(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelQueryRepository,
            repo.ChannelCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.MessageQueryRepository,
            repo.MessageCommandRepository,
            repo.ChannelGroupTimelineCommandRepository,
            repo.ChannelReadStateQueryRepository,
            repo.ChannelReadStateCommandRepository,
            repo.ChannelTimelineQueryRepository,
            repo.TransactionRepository
        )
    })
})
