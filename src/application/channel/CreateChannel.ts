import { ChannelEntity, ErrorCodes as DomainErrorCodes } from "../../domain/entity/Channel"
import { ChannelGroupdId, UserId } from "../../domain/types"
import { CreateChannelPermission, ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateChannel"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IChannelCommandRepository } from "../../domain/repository/command/Channel"
import { IChannelGroupQueryRepository } from "../../domain/repository/query/ChannelGroup"
import { IUserQueryRepository } from "../../domain/repository/query/User"

export const ErrorCodes = {
    InternalError: "internal_error",
    NameNotMeetPolicy: "name_not_meet_policy",
    MinimumTrustRankNotMeetPolicy: "minimum_trust_rank_not_meet_policy",
    ParentNotFound: "parent_not_found",
    ...ServiceErrorCodes,
} as const

export class CreateChannelApplication {
    private channelCommandRepository: IChannelCommandRepository
    private channelGroupQueryRepository: IChannelGroupQueryRepository
    private checkPermissionToCreateChannelService: CreateChannelPermission
    constructor(
        userQueryRepository: IUserQueryRepository,
        channelGroupQueryRepository: IChannelGroupQueryRepository,
        channelCommandRepository: IChannelCommandRepository
    ) {
        this.channelCommandRepository = channelCommandRepository
        this.channelGroupQueryRepository = channelGroupQueryRepository
        this.checkPermissionToCreateChannelService = new CreateChannelPermission(
            userQueryRepository,
            channelGroupQueryRepository
        )
    }
    async create({
        createdBy,
        name,
        parentChannelGroupId,
        minimumTrustRank,
    }: {
        createdBy: UserId
        name: string
        parentChannelGroupId: ChannelGroupdId
        minimumTrustRank: string
    }) {
        const parentChannelGroup = await this.channelGroupQueryRepository.findById(parentChannelGroupId)
        if (parentChannelGroup == null) {
            throw new ApplicationError(ErrorCodes.ParentNotFound)
        }
        try {
            await this.checkPermissionToCreateChannelService.hasThrow(createdBy, parentChannelGroup.id)
            const channelGroup = new ChannelEntity({
                id: -1,
                name: name,
                uniqueName: ChannelEntity.generateUniqueName(),
                parentChannelGroupId: parentChannelGroupId,
                createdBy: createdBy,
                createdAt: new Date(),
                minimumTrustRank: minimumTrustRank,
            })
            channelGroup.id = await this.channelCommandRepository.add(channelGroup)
            return channelGroup
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
