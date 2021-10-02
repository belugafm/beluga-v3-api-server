import {
    ILoginSessionsQueryRepository,
    SortBy,
    SortOrder,
} from "../domain/repository/query/LoginSessions"

import { ApplicationError } from "./ApplicationError"
import { ILoginCredentialsCommandRepository } from "../domain/repository/command/LoginCredentials"
import { ILoginCredentialsQueryRepository } from "../domain/repository/query/LoginCredentials"
import { ILoginSessionsCommandRepository } from "../domain/repository/command/LoginSessions"
import { IUsersCommandRepository } from "../domain/repository/command/Users"
import { IUsersQueryRepository } from "../domain/repository/query/Users"
import { UserId } from "../domain/types"

export const ErrorCodes = {
    UserNotFound: "user_not_found",
    CredentialNotFound: "credential_not_found",
    InternalError: "internal_error",
} as const

export class DeleteUserApplication {
    private usersQueryRepository: IUsersQueryRepository
    private usersCommandRepository: IUsersCommandRepository
    private loginCredentialsQueryRepository: ILoginCredentialsQueryRepository
    private loginCredentialsCommandRepository: ILoginCredentialsCommandRepository
    private loginSessionsQueryRepository: ILoginSessionsQueryRepository
    private loginSessionsCommandRepository: ILoginSessionsCommandRepository
    constructor(
        usersQueryRepository: IUsersQueryRepository,
        usersCommandRepository: IUsersCommandRepository,
        loginCredentialsQueryRepository: ILoginCredentialsQueryRepository,
        loginCredentialsCommandRepository: ILoginCredentialsCommandRepository,
        loginSessionsQueryRepository: ILoginSessionsQueryRepository,
        loginSessionsCommandRepository: ILoginSessionsCommandRepository
    ) {
        this.usersCommandRepository = usersCommandRepository
        this.usersQueryRepository = usersQueryRepository
        this.loginCredentialsQueryRepository = loginCredentialsQueryRepository
        this.loginCredentialsCommandRepository = loginCredentialsCommandRepository
        this.loginSessionsQueryRepository = loginSessionsQueryRepository
        this.loginSessionsCommandRepository = loginSessionsCommandRepository
    }
    async delete(userId: UserId) {
        const user = await this.usersQueryRepository.findById(userId)
        if (user == null) {
            throw new ApplicationError(ErrorCodes.UserNotFound)
        }
        await this.usersCommandRepository.delete(user)
        const sessions = await this.loginSessionsQueryRepository.findByUserId(
            user.id,
            SortBy.CreatedAt,
            SortOrder.Descending
        )
        for (const session of sessions) {
            await this.loginSessionsCommandRepository.delete(session)
        }
        const credential = await this.loginCredentialsQueryRepository.findByUserId(user.id)
        if (credential == null) {
            throw new ApplicationError(ErrorCodes.CredentialNotFound)
        }
        await this.loginCredentialsCommandRepository.delete(credential)
        return true
    }
}
