import { ErrorCodes, LoginSessionEntity } from "../../../src/domain/entity/LoginSession"

import { DomainError } from "../../../src/domain/DomainError"

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
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("InvalidUserId", (userId) => {
        expect.assertions(2)
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
    it.each([1.5, new Date(), {}, [], true, false])("InvalidDevice", (device) => {
        expect.assertions(2)
        const userId = 1
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
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("InvalidIpAddress", (ipAddress) => {
        expect.assertions(2)
        const userId = 1
        const device = "chrome"
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
