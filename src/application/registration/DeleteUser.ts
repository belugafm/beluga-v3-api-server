import {
    ILoginSessionQueryRepository,
    SortBy,
    SortOrder,
} from "../../domain/repository/query/LoginSession"

import { ApplicationError } from "../ApplicationError"
import { ILoginCredentialCommandRepository } from "../../domain/repository/command/LoginCredential"
import { ILoginCredentialQueryRepository } from "../../domain/repository/query/LoginCredential"
import { ILoginSessionCommandRepository } from "../../domain/repository/command/LoginSession"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { UserId } from "../../domain/types"

export const ErrorCodes = {
    UserNotFound: "user_not_found",
    CredentialNotFound: "credential_not_found",
    InternalError: "internal_error",
} as const

export class DeleteUserApplication {
    private userQueryRepository: IUserQueryRepository
    private userCommandRepository: IUserCommandRepository
    private loginCredentialsQueryRepository: ILoginCredentialQueryRepository
    private loginCredentialsCommandRepository: ILoginCredentialCommandRepository
    private loginSessionQueryRepository: ILoginSessionQueryRepository
    private loginSessionCommandRepository: ILoginSessionCommandRepository
    constructor(
        usersQueryRepository: IUserQueryRepository,
        usersCommandRepository: IUserCommandRepository,
        loginCredentialsQueryRepository: ILoginCredentialQueryRepository,
        loginCredentialsCommandRepository: ILoginCredentialCommandRepository,
        loginSessionsQueryRepository: ILoginSessionQueryRepository,
        loginSessionsCommandRepository: ILoginSessionCommandRepository
    ) {
        this.userCommandRepository = usersCommandRepository
        this.userQueryRepository = usersQueryRepository
        this.loginCredentialsQueryRepository = loginCredentialsQueryRepository
        this.loginCredentialsCommandRepository = loginCredentialsCommandRepository
        this.loginSessionQueryRepository = loginSessionsQueryRepository
        this.loginSessionCommandRepository = loginSessionsCommandRepository
    }
    async delete(userId: UserId) {
        const user = await this.userQueryRepository.findById(userId)
        if (user == null) {
            throw new ApplicationError(ErrorCodes.UserNotFound)
        }
        await this.userCommandRepository.delete(user)
        const sessions = await this.loginSessionQueryRepository.findByUserId(
            user.id,
            SortBy.CreatedAt,
            SortOrder.Descending
        )
        for (const session of sessions) {
            await this.loginSessionCommandRepository.delete(session)
        }
        const credential = await this.loginCredentialsQueryRepository.findByUserId(user.id)
        if (credential == null) {
            throw new ApplicationError(ErrorCodes.CredentialNotFound)
        }
        await this.loginCredentialsCommandRepository.delete(credential)
        return true
    }
}
