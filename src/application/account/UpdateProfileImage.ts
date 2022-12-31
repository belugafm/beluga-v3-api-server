import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { FileEntity } from "../../domain/entity/File"
import { IMediaRepository } from "../../domain/repository/Media"
import { IStorageCommandRepository } from "../../domain/repository/command/Storage"
import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateChannel"
import { UpdateProfileImagePermission } from "../../domain/permission/UpdateProfileImage"
import { UserId } from "../../domain/types"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { IUserQueryRepository } from "../../domain/repository/query/User"

export const ErrorCodes = {
    InternalError: "internal_error",
    InvalidBuffer: "invalid_buffer",
    InvalidImageSize: "invalid_image_size",
    InvalidType: "invalid_type",
    ...ServiceErrorCodes,
} as const

export class UpdateProfileImageApplication {
    private userQueryRepository: IUserQueryRepository
    private userCommandRepository: IUserCommandRepository
    private storageCommandRepository: IStorageCommandRepository
    private mediaRepository: IMediaRepository
    private permission: UpdateProfileImagePermission
    constructor(
        userQueryRepository: IUserQueryRepository,
        userCommandRepository: IUserCommandRepository,
        storageCommandRepository: IStorageCommandRepository,
        mediaRepository: IMediaRepository,
        permission: UpdateProfileImagePermission
    ) {
        this.userQueryRepository = userQueryRepository
        this.userCommandRepository = userCommandRepository
        this.storageCommandRepository = storageCommandRepository
        this.mediaRepository = mediaRepository
        this.permission = permission
    }
    async upload({ userId, buffer }: { userId: UserId; buffer: Buffer }): Promise<FileEntity> {
        try {
            await this.permission.hasThrow(userId)
            const user = await this.userQueryRepository.findById(userId)
            if (user == null) {
                throw new ApplicationError(ErrorCodes.InternalError)
            }
            const itemList = await this.mediaRepository.prepareFilesToUpload(userId, buffer)
            for (const item of itemList) {
                const { file, buffer } = item
                if (file.tag == "small_square") {
                    await this.storageCommandRepository.put(buffer, file.path)
                    user.profileImageUrl = file.getPublicUrl()
                    await this.userCommandRepository.update(user)
                    return file
                }
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        } catch (error) {
            console.error(error)
            if (error instanceof DomainError) {
                if (error.code === ServiceErrorCodes.DoNotHavePermission) {
                    throw new ApplicationError(ErrorCodes.DoNotHavePermission)
                }
            }
            if (error instanceof ApplicationError) {
                throw error
            }
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
