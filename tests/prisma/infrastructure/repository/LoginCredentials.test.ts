import { LoginCredentialCommandRepository } from "../../../../src/infrastructure/prisma/repository/command/LoginCredential"
import { LoginCredentialEntity } from "../../../../src/domain/entity/LoginCredential"
import { LoginCredentialQueryRepository } from "../../../../src/infrastructure/prisma/repository/query/LoginCredential"
import { UserCommandRepository } from "../../../../src/infrastructure/prisma/repository/command/User"
import { UserEntity } from "../../../../src/domain/entity/User"
import { generateRandomIpAddress } from "../../functions"

jest.setTimeout(30000)

describe("LoginCredentialsRepository", () => {
    test("Normal", async () => {
        const userCommandRepository = new UserCommandRepository()
        const loginCredentialQueryRepository = new LoginCredentialQueryRepository()
        const loginCredentialsCommandRepository = new LoginCredentialCommandRepository()

        const user = new UserEntity({ id: -1, name: "hoge", registrationIpAddress: generateRandomIpAddress() })
        user.id = await userCommandRepository.add(user)
        const loginCredential = await LoginCredentialEntity.new(user.id, "password")
        await loginCredentialsCommandRepository.add(loginCredential)

        {
            const _credential = await loginCredentialQueryRepository.findByUserId(user.id)
            expect(_credential).toBeInstanceOf(LoginCredentialEntity)
            expect(_credential?.userId).toBe(loginCredential.userId)
            expect(_credential?.passwordHash).toBe(loginCredential.passwordHash)
        }

        const newPassword = "new_password"
        const newLoginCredential = await LoginCredentialEntity.new(user.id, newPassword)
        const success = await loginCredentialsCommandRepository.update(newLoginCredential)
        expect(success).toBeTruthy()

        const _credential = await loginCredentialQueryRepository.findByUserId(user.id)
        expect(_credential).toBeInstanceOf(LoginCredentialEntity)
        expect(_credential?.userId).toBe(loginCredential.userId)
        expect(_credential?.passwordHash).toBe(newLoginCredential.passwordHash)

        const succeeded = await loginCredentialsCommandRepository.delete(newLoginCredential)
        expect(succeeded).toBeTruthy()

        {
            const _credential = await loginCredentialQueryRepository.findByUserId(user.id)
            expect(_credential).toBeNull()
        }
        await userCommandRepository.delete(user)
    })
})
