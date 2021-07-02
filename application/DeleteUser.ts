import { ApplicationError } from "./ApplicationError"
import { ILoginCredentialsRepository } from "../domain/repository/LoginCredentials"
import { ILoginSessionsRepository } from "../domain/repository/LoginSessions"
import { IUsersRepository } from "../domain/repository/Users"

export const ErrorCodes = {
    InternalError: "internal_error",
} as const

export class DeleteUserApplication {
    private usersRepository: IUsersRepository
    private loginCredentialsRepository: ILoginCredentialsRepository
    private loginSessionsRepository: ILoginSessionsRepository
    constructor(
        usersRepository: IUsersRepository,
        loginCredentialsRepository: ILoginCredentialsRepository,
        loginSessionsRepository: ILoginSessionsRepository
    ) {
        this.usersRepository = usersRepository
        this.loginCredentialsRepository = loginCredentialsRepository
        this.loginSessionsRepository = loginSessionsRepository
    }
    async delete(userId: UserId) {
        try {
            await this.usersRepository.delete(userId)
            await this.loginCredentialsRepository.delete(userId)
            await this.loginSessionsRepository.deleteAll(userId)
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
