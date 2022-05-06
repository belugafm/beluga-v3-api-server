import { ApplicationError } from "../ApplicationError"
import { ConvertHeicToJpegService } from "../../domain/service/ConvertHeicToJpeg"
import { CreateImageThumbnailService } from "../../domain/service/CreateImageThumbnail"
import { DomainError } from "../../domain/DomainError"
import { ExtractFrameFromVideoService } from "../../domain/service/ExtractFrameFromVideo"
import { FileEntity } from "../../domain/entity/File"
import { IFileCommandRepository } from "../../domain/repository/command/File"
import { IFileQueryRepository } from "../../domain/repository/query/File"
import { IStorageCommandRepository } from "../../domain/repository/command/Storage"
import { RemoveImageExifService } from "../../domain/service/RemoveImageExif"
import { ErrorCodes as ServiceErrorCodes } from "../../domain/permission/CreateChannel"
import { UploadMediaPermission } from "../../domain/permission/UploadMedia"
import { UserId } from "../../domain/types"
import config from "../../config/app"
import { fromBuffer } from "file-type"
import probe from "probe-image-size"
import sharp from "sharp"

export const ErrorCodes = {
    InternalError: "internal_error",
    InvalidBuffer: "invalid_buffer",
    InvalidImageSize: "invalid_image_size",
    InvalidType: "invalid_type",
    ...ServiceErrorCodes,
} as const

export class UploadMediaApplication {
    private fileQueryRepository: IFileQueryRepository
    private fileCommandRepository: IFileCommandRepository
    private storageCommandRepository: IStorageCommandRepository
    private permission: UploadMediaPermission
    constructor(
        fileQueryRepository: IFileQueryRepository,
        fileCommandRepository: IFileCommandRepository,
        storageCommandRepository: IStorageCommandRepository,
        permission: UploadMediaPermission
    ) {
        this.fileQueryRepository = fileQueryRepository
        this.fileCommandRepository = fileCommandRepository
        this.storageCommandRepository = storageCommandRepository
        this.permission = permission
    }
    async mayRemoveExifExceptOrientation(
        buffer: Buffer,
        type: string
    ): Promise<[Buffer, sharp.WriteableMetadata | null]> {
        if (type == "gif") {
            // https://github.com/libvips/libvips/issues/2576
            return [buffer, null]
        }
        return await new RemoveImageExifService().process(buffer)
    }
    async uploadHeicImage(userId: UserId, heicBuffer: Buffer): Promise<FileEntity[]> {
        const [jpgBuffer, size] = await new ConvertHeicToJpegService().process(heicBuffer)
        if (size == null) {
            throw new ApplicationError(ErrorCodes.InvalidImageSize)
        }
        const ret = []
        const type = "jpg"
        const group = FileEntity.generateGroup()
        const origPath = FileEntity.getPath(type, group)
        const createdAt = new Date()
        const { width, height } = size
        const [origBuffer, metadata] = await this.mayRemoveExifExceptOrientation(jpgBuffer, type)
        const origFile = new FileEntity({
            id: -1,
            userId: userId,
            type: type,
            group: group,
            path: origPath,
            original: true,
            width: width,
            height: height,
            bytes: origBuffer.length,
            createdAt: createdAt,
        })
        origFile.id = await this.fileCommandRepository.add(origFile)
        await this.storageCommandRepository.put(origBuffer, origFile.path)
        ret.push(origFile)

        const service = new CreateImageThumbnailService(origBuffer)
        // @ts-ignore
        const thumbnails = await service.process(metadata, type)
        for (const thumbnail of thumbnails) {
            const path = FileEntity.getTaggedPath(type, group, thumbnail.tag)
            const thumbnailFile = new FileEntity({
                id: -1,
                userId: userId,
                type: type,
                group: group,
                path: path,
                original: false,
                width: thumbnail.metadata.width,
                height: thumbnail.metadata.height,
                tag: thumbnail.tag,
                bytes: thumbnail.buffer.length,
                createdAt: createdAt,
            })
            thumbnailFile.id = await this.fileCommandRepository.add(thumbnailFile)
            await this.storageCommandRepository.put(thumbnail.buffer, thumbnailFile.path)
            ret.push(thumbnailFile)
        }
        return ret
    }
    async uploadImage(userId: UserId, inputBuffer: Buffer, type: string): Promise<FileEntity[]> {
        const ret = []
        const group = FileEntity.generateGroup()
        const origPath = FileEntity.getPath(type, group)
        const createdAt = new Date()
        const size = probe.sync(inputBuffer)
        if (size == null) {
            throw new ApplicationError(ErrorCodes.InvalidImageSize)
        }
        const [origBuffer, metadata] = await this.mayRemoveExifExceptOrientation(inputBuffer, type)
        const { width, height } = size
        const origFile = new FileEntity({
            id: -1,
            userId: userId,
            type: type,
            group: group,
            path: origPath,
            original: true,
            width: width,
            height: height,
            bytes: inputBuffer.length,
            createdAt: createdAt,
        })
        origFile.id = await this.fileCommandRepository.add(origFile)
        await this.storageCommandRepository.put(origBuffer, origFile.path)
        ret.push(origFile)

        const service = new CreateImageThumbnailService(origBuffer)
        // @ts-ignore
        const thumbnails = await service.process(metadata, type)
        for (const thumbnail of thumbnails) {
            const path = FileEntity.getTaggedPath(type, group, thumbnail.tag)
            const thumbnailFile = new FileEntity({
                id: -1,
                userId: userId,
                type: type,
                group: group,
                path: path,
                original: false,
                width: thumbnail.metadata.width,
                height: thumbnail.metadata.height,
                tag: thumbnail.tag,
                bytes: thumbnail.buffer.length,
                createdAt: createdAt,
            })
            thumbnailFile.id = await this.fileCommandRepository.add(thumbnailFile)
            await this.storageCommandRepository.put(thumbnail.buffer, thumbnailFile.path)
            ret.push(thumbnailFile)
        }
        return ret
    }
    async uploadVideo(userId: UserId, videoBuffer: Buffer, type: string): Promise<FileEntity[]> {
        const ret: FileEntity[] = []
        const group = FileEntity.generateGroup()
        const origPath = FileEntity.getPath(type, group)
        const createdAt = new Date()
        const [posterBuffer, resolution] = await new ExtractFrameFromVideoService().process(videoBuffer, type)

        const origFile = new FileEntity({
            id: -1,
            userId: userId,
            type: type,
            group: group,
            path: origPath,
            original: true,
            width: resolution.width,
            height: resolution.height,
            bytes: videoBuffer.length,
            createdAt: createdAt,
        })
        origFile.id = await this.fileCommandRepository.add(origFile)
        await this.storageCommandRepository.put(videoBuffer, origFile.path)
        ret.push(origFile)

        const service = new CreateImageThumbnailService(posterBuffer)
        const thumbnailType = "jpg"
        // @ts-ignore
        const thumbnails = await service.process(null, thumbnailType)
        for (const thumbnail of thumbnails) {
            const path = FileEntity.getTaggedPath(thumbnailType, group, thumbnail.tag)
            const thumbnailFile = new FileEntity({
                id: -1,
                userId: userId,
                type: type,
                group: group,
                path: path,
                original: false,
                bytes: thumbnail.buffer.length,
                createdAt: createdAt,
                width: thumbnail.metadata.width,
                height: thumbnail.metadata.height,
                tag: thumbnail.tag,
            })
            thumbnailFile.id = await this.fileCommandRepository.add(thumbnailFile)
            await this.storageCommandRepository.put(thumbnail.buffer, thumbnailFile.path)
            ret.push(thumbnailFile)
        }
        return ret
    }
    async upload({ userId, buffer }: { userId: UserId; buffer: Buffer }): Promise<FileEntity[]> {
        try {
            await this.permission.hasThrow(userId)
            // this.storageCommandRepository.put(buffer, "/media/" + basename + "." + ext)
            this.fileQueryRepository
            this.fileCommandRepository
            this.storageCommandRepository
            const fileType = await fromBuffer(buffer)
            if (fileType == null) {
                throw new ApplicationError(ErrorCodes.InvalidBuffer)
            }
            const type = fileType.ext
            if (type == "heic") {
                // iOS
                return await this.uploadHeicImage(userId, buffer)
            }
            if (config.file.allowed_file_types.image.includes(type)) {
                return await this.uploadImage(userId, buffer, type)
            }
            if (config.file.allowed_file_types.video.includes(type)) {
                return await this.uploadVideo(userId, buffer, type)
            }
            throw new ApplicationError(ErrorCodes.InvalidType)
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
