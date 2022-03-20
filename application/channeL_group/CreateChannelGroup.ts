import {
    ChannelGroupEntity,
    ErrorCodes as DomainErrorCodes,
} from "../../domain/entity/ChannelGroup"
import { ChannelGroupdId, UserId } from "../../domain/types"
import {
    CheckPermissionToCreateChannelGroupService,
    ErrorCodes as ServiceErrorCodes,
} from "../../domain/service/CheckPermissionToCreateChannelGroup"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IChannelGroupCommandRepository } from "../../domain/repository/command/ChannelGroup"
import { IChannelGroupQueryRepository } from "../../domain/repository/query/ChannelGroup"
import { IUserQueryRepository } from "../../domain/repository/query/User"

export const ErrorCodes = {
    InternalError: "internal_error",
    NameNotMeetPolicy: "name_not_meet_policy",
    ParentNotFound: "parent_not_found",
    ...ServiceErrorCodes,
} as const

export class CreateChannelGroupApplication {
    private channelGroupCommandRepository: IChannelGroupCommandRepository
    private channelGroupQueryRepository: IChannelGroupQueryRepository
    private checkPermissionToCreateChannelGroupService: CheckPermissionToCreateChannelGroupService
    constructor(
        userQueryRepository: IUserQueryRepository,
        channelGroupQueryRepository: IChannelGroupQueryRepository,
        channelGroupCommandRepository: IChannelGroupCommandRepository
    ) {
        this.channelGroupCommandRepository = channelGroupCommandRepository
        this.channelGroupQueryRepository = channelGroupQueryRepository
        this.checkPermissionToCreateChannelGroupService =
            new CheckPermissionToCreateChannelGroupService(userQueryRepository)
    }
    async create({
        createdBy,
        name,
        parentId,
    }: {
        createdBy: UserId
        name: string
        parentId: ChannelGroupdId
    }) {
        const parentChannel = await this.channelGroupQueryRepository.findById(parentId)
        if (parentChannel == null) {
            throw new ApplicationError(ErrorCodes.ParentNotFound)
        }
        try {
            await this.checkPermissionToCreateChannelGroupService.tryCheckIfUserHasPermission(
                createdBy
            )
            const channel = new ChannelGroupEntity({
                id: -1,
                name: name,
                uniqueName: ChannelGroupEntity.generateUniqueName(),
                parentId: parentId,
                createdBy: createdBy,
                createdAt: new Date(),
            })
            channel.id = await this.channelGroupCommandRepository.add(channel)
            return channel
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === DomainErrorCodes.InvalidName) {
                    throw new ApplicationError(ErrorCodes.NameNotMeetPolicy)
                }
                if (error.code === ServiceErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
