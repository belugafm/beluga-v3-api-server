import { LoginCredentialModel } from "../../domain/model/LoginCredential"
import { UserModel } from "../../domain/model/User"

jest.setTimeout(30000)

describe("signup", () => {
    test("signup", async () => {
        const user_id = "hoge"
        const user = new UserModel(user_id, "test")
    })
})
