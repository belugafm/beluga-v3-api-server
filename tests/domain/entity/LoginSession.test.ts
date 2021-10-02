import { ErrorCodes, LoginSessionEntity } from "../../../domain/entity/LoginSession"

import { DomainError } from "../../../domain/DomainError"

describe("LoginSessionEntity", () => {
    test("Normal", async () => {
        const userId = 1
        const ipAddress = "192.168.1.1"
        const session = new LoginSessionEntity({ userId, ipAddress })
        expect(session).toBeInstanceOf(LoginSessionEntity)
        expect(typeof session.sessionId).toBe("string")
    })
    test("Normal", async () => {
        const userId = 1
        const ipAddress = "192.168.1.1"
        const device = "chrome"
        const session = new LoginSessionEntity({ userId, ipAddress, device })
        expect(session).toBeInstanceOf(LoginSessionEntity)
        expect(typeof session.sessionId).toBe("string")
        expect(typeof session.device).toBe("string")
    })
    test("Errors", async () => {
        expect.assertions(2)
        const userId = true
        const ipAddress = "192.168.1.1"
        try {
            // @ts-ignore
            const session = new LoginSessionEntity({ userId, ipAddress })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUserId)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        const userId = 1
        const device = true
        const ipAddress = "192.168.1.1"
        try {
            // @ts-ignore
            const session = new LoginSessionEntity({ userId, ipAddress, device })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidDevice)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        const userId = 1
        const device = 1
        const ipAddress = "192.168.1.1"
        try {
            // @ts-ignore
            const session = new LoginSessionEntity({ userId, ipAddress, device })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidDevice)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        const userId = 1
        const device = "chrome"
        const ipAddress = 1
        try {
            // @ts-ignore
            const session = new LoginSessionEntity({ userId, ipAddress, device })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidIpAddress)
            }
        }
    })
})
