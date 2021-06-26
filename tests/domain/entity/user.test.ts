import { UserEntity } from "../../../domain/entity/User"

describe("UserEntity", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.twitterUserId = "1111"
    })
})
