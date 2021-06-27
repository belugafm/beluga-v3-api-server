import { ErrorCodes, RegisterUserApplication } from "../../application/RegisterUser"
import { UserRegistrationRepository, UsersRepository } from "../../web/repository"

import { ApplicationError } from "../../application/ApplicationError"
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
        await usersRepository.delete(user.id)
    })
    test("NameTaken", async () => {
        const usersRepository = new UsersRepository()
        const userRegistrationRepository = new UserRegistrationRepository()
        const app = new RegisterUserApplication(usersRepository, userRegistrationRepository)
        const name = "admin"
        const user = await app.register({
            name,
            password: "password",
            ipAddress: "192.168.1.1",
        })
        try {
            await app.register({
                name,
                password: "password",
                ipAddress: "192.168.1.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.NameTaken)
            }
        }
        await usersRepository.delete(user.id)
    })
    test("UserNameNotMeetPolicy", async () => {
        const usersRepository = new UsersRepository()
        const userRegistrationRepository = new UserRegistrationRepository()
        const app = new RegisterUserApplication(usersRepository, userRegistrationRepository)
        try {
            await app.register({
                name: "admin-1234",
                password: "password",
                ipAddress: "192.168.1.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.UserNameNotMeetPolicy)
            }
        }
    })
    test("PasswordNotMeetPolicy", async () => {
        const usersRepository = new UsersRepository()
        const userRegistrationRepository = new UserRegistrationRepository()
        const app = new RegisterUserApplication(usersRepository, userRegistrationRepository)
        try {
            await app.register({
                name: "admin",
                password: "",
                ipAddress: "192.168.1.1",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.PasswordNotMeetPolicy)
            }
        }
    })
})
