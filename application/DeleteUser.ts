import {
    ILoginSessionQueryRepository,
    SortBy,
    SortOrder,
} from "../domain/repository/query/LoginSession"

import { ApplicationError } from "./ApplicationError"
import { ILoginCredentialCommandRepository } from "../domain/repository/command/LoginCredential"
import { ILoginCredentialQueryRepository } from "../domain/repository/query/LoginCredential"
import { ILoginSessionCommandRepository } from "../domain/repository/command/LoginSession"
import { IUserCommandRepository } from "../domain/repository/command/User"
import { IUserQueryRepository } from "../domain/repository/query/User"
import { UserId } from "../domain/types"

export const ErrorCodes = {
    UserNotFound: "user_not_found",
    CredentialNotFound: "credential_not_found",
    InternalError: "internal_error",
} as const

export class DeleteUserApplication {
    private usersQueryRepository: IUserQueryRepository
    private usersCommandRepository: IUserCommandRepository
    private loginCredentialsQueryRepository: ILoginCredentialQueryRepository
    private loginCredentialsCommandRepository: ILoginCredentialCommandRepository
    private loginSessionsQueryRepository: ILoginSessionQueryRepository
    private loginSessionsCommandRepository: ILoginSessionCommandRepository
    constructor(
        usersQueryRepository: IUserQueryRepository,
        usersCommandRepository: IUserCommandRepository,
        loginCredentialsQueryRepository: ILoginCredentialQueryRepository,
        loginCredentialsCommandRepository: ILoginCredentialCommandRepository,
        loginSessionsQueryRepository: ILoginSessionQueryRepository,
        loginSessionsCommandRepository: ILoginSessionCommandRepository
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
