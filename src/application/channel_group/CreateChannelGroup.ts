import { ChannelGroupEntity, ErrorCodes as DomainErrorCodes } from "../../domain/entity/ChannelGroup"
import { ChannelGroupdId, UserId } from "../../domain/types"
import {
    CreateChannelGroupPermission,
    ErrorCodes as ServiceErrorCodes,
} from "../../domain/permission/CreateChannelGroup"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IChannelGroupCommandRepository } from "../../domain/repository/command/ChannelGroup"
import { IChannelGroupQueryRepository } from "../../domain/repository/query/ChannelGroup"
import { IUserQueryRepository } from "../../domain/repository/query/User"

export const ErrorCodes = {
    InternalError: "internal_error",
    NameNotMeetPolicy: "name_not_meet_policy",
    MinimumTrustRankNotMeetPolicy: "minimum_trust_rank_not_meet_policy",
    ParentNotFound: "parent_not_found",
    ...ServiceErrorCodes,
} as const

export class CreateChannelGroupApplication {
    private channelGroupCommandRepository: IChannelGroupCommandRepository
    private channelGroupQueryRepository: IChannelGroupQueryRepository
    private checkPermissionToCreateChannelGroupService: CreateChannelGroupPermission
    constructor(
        userQueryRepository: IUserQueryRepository,
        channelGroupQueryRepository: IChannelGroupQueryRepository,
        channelGroupCommandRepository: IChannelGroupCommandRepository
    ) {
        this.channelGroupCommandRepository = channelGroupCommandRepository
        this.channelGroupQueryRepository = channelGroupQueryRepository
        this.checkPermissionToCreateChannelGroupService = new CreateChannelGroupPermission(
            userQueryRepository,
            channelGroupQueryRepository
        )
    }
    async create({
        createdBy,
        name,
        parentId,
        minimumTrustRank,
    }: {
        createdBy: UserId
        name: string
        parentId: ChannelGroupdId
        minimumTrustRank: string
    }) {
        const parentChannelGroup = await this.channelGroupQueryRepository.findById(parentId)
        if (parentChannelGroup == null) {
            throw new ApplicationError(ErrorCodes.ParentNotFound)
        }
        try {
            await this.checkPermissionToCreateChannelGroupService.hasThrow(createdBy, parentChannelGroup.id)
            const channelGroup = new ChannelGroupEntity({
                id: -1,
                name: name,
                uniqueName: ChannelGroupEntity.generateUniqueName(),
                parentId: parentId,
                level: parentChannelGroup.level,
                createdBy: createdBy,
                createdAt: new Date(),
                minimumTrustRank: minimumTrustRank,
            })
            channelGroup.id = await this.channelGroupCommandRepository.add(channelGroup)
            return channelGroup
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === DomainErrorCodes.InvalidName) {
                    throw new ApplicationError(ErrorCodes.NameNotMeetPolicy)
                }
                if (error.code === DomainErrorCodes.InvalidMinimumTrustRank) {
                    throw new ApplicationError(ErrorCodes.MinimumTrustRankNotMeetPolicy)
                }
                if (error.code === ServiceErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
