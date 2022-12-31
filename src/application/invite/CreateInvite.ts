import { MessageId, UserId } from "../../domain/types"

import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { CreateInvitePermission, ErrorCodes as PermissionErrorCodes } from "../../domain/permission/CreateInvite"
import { IInviteCommandRepository } from "../../domain/repository/command/Invite"
import { InviteEntity } from "../../domain/entity/Invite"

export const ErrorCodes = {
    InternalError: "internal_error",
    RequestUserNotFound: "request_user_not_found",
    ...PermissionErrorCodes,
} as const

export class CreateInviteApplication {
    private inviteCommandRepository: IInviteCommandRepository
    private userQueryRepository: IUserQueryRepository
    private permissionToCreateInvite: CreateInvitePermission
    constructor(userQueryRepository: IUserQueryRepository, inviteCommandRepository: IInviteCommandRepository) {
        this.userQueryRepository = userQueryRepository
        this.inviteCommandRepository = inviteCommandRepository
        this.permissionToCreateInvite = new CreateInvitePermission(userQueryRepository)
    }
    async create(requestUserId: UserId): Promise<InviteEntity> {
        const requestUser = await this.userQueryRepository.findById(requestUserId)
        if (requestUser == null) {
            throw new ApplicationError(ErrorCodes.RequestUserNotFound)
        }
        try {
            await this.permissionToCreateInvite.hasThrow(requestUserId)
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === PermissionErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
        try {
            const expireSeconds = 86400
            const invite = new InviteEntity({
                id: -1,
                inviterId: requestUserId,
                createdAt: new Date(),
                expireDate: new Date(Date.now() + expireSeconds * 1000),
            })
            invite.id = await this.inviteCommandRepository.add(invite)
            return invite
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
