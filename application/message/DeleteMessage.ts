import { ErrorCodes as DomainErrorCodes, MessageEntity } from "../../domain/entity/Message"
import { MessageId, UserId } from "../../domain/types"

import { ApplicationError } from "../ApplicationError"
import { DeleteMessagePermission } from "../../domain/permission/DeleteMessage"
import { DomainError } from "../../domain/DomainError"
import { IMessageCommandRepository } from "../../domain/repository/command/Message"
import { IMessageQueryRepository } from "../../domain/repository/query/Message"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { ErrorCodes as PermissionErrorCodes } from "../../domain/permission/DeleteMessage"

export const ErrorCodes = {
    InternalError: "internal_error",
    RequestUserNotFound: "request_user_not_found",
    MessageNotFound: "message_not_found",
    ...PermissionErrorCodes,
} as const

export class DeleteMessageApplication {
    private messageCommandRepository: IMessageCommandRepository
    private messageQueryRepository: IMessageQueryRepository
    private userQueryRepository: IUserQueryRepository
    private permissionToDeleteMessage: DeleteMessagePermission
    constructor(
        messageQueryRepository: IMessageQueryRepository,
        messageCommandRepository: IMessageCommandRepository,
        userQueryRepository: IUserQueryRepository
    ) {
        this.messageQueryRepository = messageQueryRepository
        this.messageCommandRepository = messageCommandRepository
        this.userQueryRepository = userQueryRepository
        this.permissionToDeleteMessage = new DeleteMessagePermission(userQueryRepository, messageQueryRepository)
    }
    async delete({ messageId, requestUserId }: { messageId: MessageId; requestUserId: UserId }) {
        const requestUser = await this.userQueryRepository.findById(requestUserId)
        if (requestUser == null) {
            throw new ApplicationError(ErrorCodes.RequestUserNotFound)
        }
        const message = await this.messageQueryRepository.findById(messageId)
        if (message == null) {
            throw new ApplicationError(ErrorCodes.MessageNotFound)
        }
        try {
            await this.permissionToDeleteMessage.hasThrow(requestUserId, messageId)
            message.deleted = true
            await this.messageCommandRepository.update(message)
        } catch (error) {
            if (error instanceof DomainError) {
                if (error.code === PermissionErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
