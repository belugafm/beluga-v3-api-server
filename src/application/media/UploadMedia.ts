import { ApplicationError } from "../ApplicationError"
import { DomainError } from "../../domain/DomainError"
import { FileEntity } from "../../domain/entity/File"
import { IFileCommandRepository } from "../../domain/repository/command/File"
import { IMediaRepository } from "../../domain/repository/Media"
import { IStorageCommandRepository } from "../../domain/repository/command/Storage"
import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateChannel"
import { UploadMediaPermission } from "../../domain/permission/UploadMedia"
import { UserId } from "../../domain/types"

export const ErrorCodes = {
    InternalError: "internal_error",
    InvalidBuffer: "invalid_buffer",
    InvalidImageSize: "invalid_image_size",
    InvalidType: "invalid_type",
    ...ServiceErrorCodes,
} as const

export class UploadMediaApplication {
    private fileCommandRepository: IFileCommandRepository
    private storageCommandRepository: IStorageCommandRepository
    private mediaRepository: IMediaRepository
    private permission: UploadMediaPermission
    constructor(
        fileCommandRepository: IFileCommandRepository,
        storageCommandRepository: IStorageCommandRepository,
        mediaRepository: IMediaRepository,
        permission: UploadMediaPermission
    ) {
        this.fileCommandRepository = fileCommandRepository
        this.storageCommandRepository = storageCommandRepository
        this.mediaRepository = mediaRepository
        this.permission = permission
    }
    async upload({ userId, buffer }: { userId: UserId; buffer: Buffer }): Promise<FileEntity[]> {
        try {
            await this.permission.hasThrow(userId)
            const itemList = await this.mediaRepository.prepareFilesToUpload(userId, buffer)
            const ret: FileEntity[] = []
            for (const item of itemList) {
                const { file, buffer } = item
                file.id = await this.fileCommandRepository.add(file)
                await this.storageCommandRepository.put(buffer, file.path)
                ret.push(file)
            }
            return ret
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
