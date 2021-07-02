import { ErrorCodes, LoginSessionEntity } from "../../../domain/entity/LoginSession"

import { DomainError } from "../../../domain/DomainError"

describe("LoginSessionEntity", () => {
    test("Normal", async () => {
        const userId = 1
        const session = new LoginSessionEntity({ userId })
        expect(session).toBeInstanceOf(LoginSessionEntity)
        expect(typeof session.sessionId).toBe("string")
    })
    test("Normal", async () => {
        const userId = 1
        const device = "chrome"
        const session = new LoginSessionEntity({ userId, device })
        expect(session).toBeInstanceOf(LoginSessionEntity)
        expect(typeof session.sessionId).toBe("string")
        expect(typeof session.device).toBe("string")
    })
    test("Errors", async () => {
        expect.assertions(2)
        const userId = true
        try {
            // @ts-ignore
            const session = new LoginSessionEntity({ userId })
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
        try {
            // @ts-ignore
            const session = new LoginSessionEntity({ userId, device })
            expect(session).toBeInstanceOf(LoginSessionEntity)
            expect(typeof session.sessionId).toBe("string")
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
        try {
            // @ts-ignore
            const session = new LoginSessionEntity({ userId, device })
            expect(session).toBeInstanceOf(LoginSessionEntity)
            expect(typeof session.sessionId).toBe("string")
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidDevice)
            }
        }
    })
})
