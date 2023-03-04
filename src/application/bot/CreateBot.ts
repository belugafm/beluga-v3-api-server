import {
    CheckUserNameAvailabilityService,
    ErrorCodes as UserNameAvailabilityErrorCodes,
} from "../../domain/service/CheckUserNameAvailability"
import { UserEntity, ErrorCodes as UserModelErrorCodes } from "../../domain/entity/User"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { TrustLevel } from "../../config/trust_level"
import { CreateBotPermission } from "../../domain/permission/CreateBot"
import { IAccessTokenCommandRepository } from "../../domain/repository/command/AccessToken"
import { IApplicationQueryRepository } from "../../domain/repository/query/Application"
import { AccessTokenEntity } from "../../domain/entity/AccessToken"
import { ApplicationId, UserId } from "../../domain/types"

export const ErrorCodes = {
    InternalError: "internal_error",
    ApplicationNotFound: "app_not_found",
    DoNotHavePermission: "do_not_have_permission",
    NameNotMeetPolicy: "name_not_meet_policy",
    DisplayNameNotMeetPolicy: "display_name_not_meet_policy",
    DescriptionNotMeetPolicy: "description_not_meet_policy",
    ...UserNameAvailabilityErrorCodes,
} as const

export class CreateBotApplication {
    private userCommandRepository: IUserCommandRepository
    private appQueryRepository: IApplicationQueryRepository
    private accessTokenCommandRepository: IAccessTokenCommandRepository
    private checkPermission: CreateBotPermission
    private checkUserNameAvailability: CheckUserNameAvailabilityService
    constructor(
        userQueryRepository: IUserQueryRepository,
        userCommandRepository: IUserCommandRepository,
        accessTokenCommandRepository: IAccessTokenCommandRepository,
        appQueryRepository: IApplicationQueryRepository
    ) {
        this.userCommandRepository = userCommandRepository
        this.appQueryRepository = appQueryRepository
        this.accessTokenCommandRepository = accessTokenCommandRepository
        this.checkPermission = new CreateBotPermission(userQueryRepository)
        this.checkUserNameAvailability = new CheckUserNameAvailabilityService(userQueryRepository)
    }
    async create({
        name,
        displayName,
        description,
        ipAddress,
        appId,
        createdBy,
    }: {
        name: string
        displayName?: string
        description?: string
        ipAddress: string
        appId: ApplicationId
        createdBy: UserId
    }): Promise<[UserEntity, AccessTokenEntity]> {
        try {
            await this.checkPermission.hasThrow(createdBy)
        } catch (error) {
            throw new ApplicationError(ErrorCodes.DoNotHavePermission)
        }
        try {
            await this.checkUserNameAvailability.hasThrow(name)
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === UserNameAvailabilityErrorCodes.NameTaken) {
                    throw new ApplicationError(ErrorCodes.NameTaken)
                }
            }
            console.error(error)
            throw new ApplicationError(ErrorCodes.InternalError)
        }
        const app = await this.appQueryRepository.findById(appId)
        if (app == null) {
            throw new ApplicationError(ErrorCodes.ApplicationNotFound)
        }
        if (app.userId != createdBy) {
            throw new ApplicationError(ErrorCodes.ApplicationNotFound)
        }
        try {
            const user = new UserEntity({
                id: -1,
                name: name,
                displayName: displayName,
                description: description,
                registrationIpAddress: ipAddress,
                bot: true,
                botOwnerId: createdBy,
                trustLevel: TrustLevel.AuthorizedUser,
            })
            user.id = await this.userCommandRepository.add(user)

            const auth = new AccessTokenEntity({
                userId: user.id,
                applicationId: app.id,
            })
            await this.accessTokenCommandRepository.add(auth)

            return [user, auth]
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === UserModelErrorCodes.InvalidName) {
                    throw new ApplicationError(ErrorCodes.NameNotMeetPolicy)
                }
                if (error.code === UserModelErrorCodes.InvalidDisplayName) {
                    throw new ApplicationError(ErrorCodes.DisplayNameNotMeetPolicy)
                }
                if (error.code === UserModelErrorCodes.InvalidDescription) {
                    throw new ApplicationError(ErrorCodes.DescriptionNotMeetPolicy)
                }
                if (error.code === UserNameAvailabilityErrorCodes.NameTaken) {
                    throw new ApplicationError(ErrorCodes.NameTaken)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
