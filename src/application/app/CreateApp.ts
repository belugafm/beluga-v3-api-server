import { ApplicationEntity } from "../../domain/entity/Application"
import { UserId } from "../../domain/types"
import { CreateApplicationPermission, ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateApplication"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IApplicationCommandRepository } from "../../domain/repository/command/Application"
import { IUserQueryRepository } from "../../domain/repository/query/User"

export const ErrorCodes = {
    InternalError: "internal_error",
    NameNotMeetPolicy: "name_not_meet_policy",
    ParentNotFound: "parent_not_found",
    ...ServiceErrorCodes,
} as const

export class CreateAppApplication {
    private appCommandRepository: IApplicationCommandRepository
    private checkPermissionToCreateAppService: CreateApplicationPermission
    constructor(userQueryRepository: IUserQueryRepository, appCommandRepository: IApplicationCommandRepository) {
        this.appCommandRepository = appCommandRepository
        this.checkPermissionToCreateAppService = new CreateApplicationPermission(userQueryRepository)
    }
    async create({
        userId,
        name,
        description,
        callbackUrl,
        read,
        write,
    }: {
        userId: UserId
        name: string
        description: string
        callbackUrl: string
        read: boolean
        write: boolean
    }) {
        try {
            await this.checkPermissionToCreateAppService.hasThrow(userId)
            const app = new ApplicationEntity({
                id: -1,
                name: name,
                description: description,
                callbackUrl: callbackUrl,
                userId: userId,
                createdAt: new Date(),
                read,
                write,
            })
            app.id = await this.appCommandRepository.add(app)
            return app
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === ServiceErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
