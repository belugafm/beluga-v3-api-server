import { ErrorCodes, LoginCredentialEntity } from "../../../domain/entity/LoginCredential"

import { DomainError } from "../../../domain/DomainError"
import config from "../../../config/app"

function generateRandomPassword(length: number) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+!\"#$%&'()~=L+*?<"
    let ret = ""
    for (let k = 0; k < length; k++) {
        ret += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return ret
}

describe("LoginCredentialEntity", () => {
    test("Normal", async () => {
        const userId = 1
        const password = generateRandomPassword(config.user_login_credential.password.min_length)
        const credential = await LoginCredentialEntity.new(userId, password)
        expect(credential).toBeInstanceOf(LoginCredentialEntity)
    })
    test("PasswordNotMeetPolicy", async () => {
        expect.assertions(2)
        const userId = 1
        const password = generateRandomPassword(config.user_login_credential.password.min_length - 1)
        try {
            await LoginCredentialEntity.new(userId, password)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.PasswordNotMeetPolicy)
            }
        }
    })
    test("PasswordNotMeetPolicy", async () => {
        expect.assertions(2)
        const userId = 1
        const password = generateRandomPassword(config.user_login_credential.password.max_length + 1)
        try {
            await LoginCredentialEntity.new(userId, password)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.PasswordNotMeetPolicy)
            }
        }
    })
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("InvaidPasswordInput", async (password) => {
        expect.assertions(2)
        const userId = 1
        try {
            //@ts-ignore
            await LoginCredentialEntity.new(userId, password)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvaidPasswordInput)
            }
        }
    })
})
