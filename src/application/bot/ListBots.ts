import { UserId } from "../../domain/types"
import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateApplication"

import { ApplicationError } from "../ApplicationError"
import { IUserQueryRepository } from "../../domain/repository/query/User"

export const ErrorCodes = {
    InternalError: "internal_error",
    ...ServiceErrorCodes,
} as const

export class ListBotsApplication {
    private userQueryRepository: IUserQueryRepository
    constructor(userQueryRepository: IUserQueryRepository) {
        this.userQueryRepository = userQueryRepository
    }
    async list({ userId }: { userId: UserId }) {
        try {
            return await this.userQueryRepository.listBots(userId)
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
