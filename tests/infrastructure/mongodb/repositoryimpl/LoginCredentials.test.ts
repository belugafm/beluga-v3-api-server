import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { LoginCredentialsRepository } from "../../../../infrastructure/mongodb/repositoryimpl/LoginCredentials"
import { db } from "../../../mongodb"

jest.setTimeout(30000)

describe("LoginCredentialsRepository", () => {
    beforeAll(async () => {
        await db.connect()
    })
    afterAll(async () => {
        await db.disconnect()
    })
    test("Add and Delete", async () => {
        const repository = new LoginCredentialsRepository()
        const userId = "507f1f77bcf86cd799439011"
        const password = "password"
        const credential = await LoginCredentialEntity.new(userId, password)
        await repository.add(credential)
        const _credential = await repository.findByUserId(userId)
        expect(_credential).not.toBeNull()
        expect(_credential?.userId).toBe(credential.userId)
        expect(_credential?.passwordHash).toBe(credential.passwordHash)

        const succeeded = await repository.delete(userId)
        expect(succeeded).toBeTruthy()

        {
            const _credential = await repository.findByUserId(userId)
            expect(_credential).toBeNull()
        }
    })
})
