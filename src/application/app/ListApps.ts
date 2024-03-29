import { UserId } from "../../domain/types"
import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateApplication"

import { ApplicationError } from "../ApplicationError"
import { IApplicationQueryRepository } from "../../domain/repository/query/Application"

export const ErrorCodes = {
    InternalError: "internal_error",
    ...ServiceErrorCodes,
} as const

export class ListAppsApplication {
    private appQueryRepository: IApplicationQueryRepository
    constructor(appQueryRepository: IApplicationQueryRepository) {
        this.appQueryRepository = appQueryRepository
    }
    async list({ userId }: { userId: UserId }) {
        try {
            return await this.appQueryRepository.list(userId)
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
