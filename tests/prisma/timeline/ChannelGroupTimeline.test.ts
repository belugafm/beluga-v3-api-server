import * as repo from "../../../src/infrastructure/prisma/repository"

import { PostMessageApplicationTests } from "./ChannelGroupTimeline"

jest.setTimeout(60000)

describe("ChannelGroupTimeline", () => {
    const testing = new PostMessageApplicationTests()
    test("Normal", async () => {
        await testing.testNormal(
            repo.UserQueryRepository,
            repo.UserCommandRepository,
            repo.ChannelQueryRepository,
            repo.ChannelCommandRepository,
            repo.ChannelGroupQueryRepository,
            repo.ChannelGroupCommandRepository,
            repo.MessageQueryRepository,
            repo.MessageCommandRepository,
            repo.ChannelGroupTimelineQueryRepository,
            repo.ChannelGroupTimelineCommandRepository,
            repo.TransactionRepository
        )
    })
})
