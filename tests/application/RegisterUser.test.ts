import { UserRegistrationRepository, UsersRepository } from "../../web/repository"

import { RegisterUserApplication } from "../../application/RegisterUser"
import { db } from "../env"

jest.setTimeout(30000)

describe("RegisterUserApplication", () => {
    beforeAll(async () => {
        await db.connect()
    })
    afterAll(async () => {
        await db.disconnect()
    })
    test("Normal", async () => {
        const usersRepository = new UsersRepository()
        const userRegistrationRepository = new UserRegistrationRepository()
        const app = new RegisterUserApplication(usersRepository, userRegistrationRepository)
        const name = "admin"
        const user = await app.register({
            name,
            password: "password",
            ipAddress: "192.168.1.1",
        })
        expect(user.name).toBe(name)
    })
})
