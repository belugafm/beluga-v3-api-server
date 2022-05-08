import { IMediaRepository, ReturnType } from "../../../domain/repository/Media"

import { FileEntity } from "../../../domain/entity/File"
import { UserId } from "../../../domain/types"
import config from "../../../config/app"
import { execSync } from "child_process"
import extractFrames from "ffmpeg-extract-frames"
import ffmpeg from "fluent-ffmpeg"
import { fromBuffer } from "file-type"
import fs from "fs"
import pathlib from "path"
import probe from "probe-image-size"
import sharp from "sharp"
import tempfile from "tmp"

const asyncFfprobe = (path: string): Promise<ffmpeg.FfprobeData> => {
    return new Promise((resolve, reject) => {
        ffmpeg(path).ffprobe((err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}
type Resolution = {
    width: number
    height: number
}
const getSizeFromFfprobeData = (metadata: ffmpeg.FfprobeData): Resolution => {
    for (const stream of metadata.streams) {
        if (stream.codec_type == "video") {
            return {
                width: stream.width as number,
                height: stream.height as number,
            }
        }
    }
    throw new Error("動画が含まれていません")
}
export class MediaRepository implements IMediaRepository {
    async convertHeicToJpeg(heicBuffer: Buffer): Promise<[Buffer, probe.ProbeResult]> {
        return new Promise((resolve, reject) => {
            tempfile.dir(async (err, baseDir) => {
                if (err) {
                    reject(err)
                }
                const inputPath = pathlib.join(baseDir, "input.heic")
                const outputPath = pathlib.join(baseDir, "output.jpg")
                const cleanup = () => {
                    fs.rmSync(baseDir, { recursive: true })
                }
                try {
                    const heicWithExif = sharp(heicBuffer)
                    const metadata = await heicWithExif.metadata()
                    const { orientation } = metadata
                    const newMetadata: sharp.WriteableMetadata = {
                        orientation, // orientationだけセット
                    }
                    fs.writeFileSync(inputPath, heicBuffer)
                    execSync(`heif-convert ${inputPath} ${outputPath}`)
                    const jpegBuffer = sharp(fs.readFileSync(outputPath))
                    const jpegWithOrientationBuffer = await jpegBuffer.withMetadata(newMetadata).toBuffer()
                    const size = probe.sync(jpegWithOrientationBuffer)
                    if (size == null) {
                        throw new Error("変換できません")
                    }
                    cleanup()
                    resolve([jpegWithOrientationBuffer, size])
                } catch (error) {
                    console.error(error)
                    cleanup()
                    reject(error)
                }
            })
        })
    }
    async createImageThumbnail(
        buffer: Buffer,
        metadata: sharp.WriteableMetadata | null,
        outputFormat: keyof sharp.FormatEnum
    ) {
        const ret: { buffer: Buffer; metadata: sharp.OutputInfo; tag: string }[] = []
        const withMetadata = (s: sharp.Sharp) => {
            if (metadata) {
                return s.withMetadata(metadata)
            }
            return s
        }
        for (const task of config.file.thumbnail_sizes) {
            const args: sharp.ResizeOptions = {
                fit: task.fit as keyof sharp.FitEnum,
            }
            if (task.width > 0) {
                args["width"] = task.width
            }
            if (task.height > 0) {
                args["height"] = task.height
            }
            const { data, info } = await withMetadata(sharp(buffer).resize(args).toFormat(outputFormat)).toBuffer({
                resolveWithObject: true,
            })
            ret.push({
                buffer: data,
                metadata: info,
                tag: task.tag,
            })
        }
        return ret
    }
    extractFrameFromVideo(buffer: Buffer, type: string): Promise<[Buffer, Resolution]> {
        return new Promise((resolve, reject) => {
            tempfile.dir(async (err, baseDir) => {
                if (err) {
                    reject(err)
                }
                const inputPath = pathlib.join(baseDir, `input.${type}`)
                const formattedOutputPath = pathlib.join(baseDir, "output_%d.jpg")
                const outputPath = pathlib.join(baseDir, "output_1.jpg")
                const cleanup = () => {
                    fs.rmSync(baseDir, { recursive: true })
                }
                try {
                    fs.writeFileSync(inputPath, buffer)
                    const metadata = await asyncFfprobe(inputPath)
                    const size = getSizeFromFfprobeData(metadata)
                    await extractFrames({
                        input: inputPath,
                        output: formattedOutputPath,
                        offsets: [0],
                    })
                    const resultBuffer = fs.readFileSync(outputPath)
                    cleanup()
                    resolve([resultBuffer, size])
                } catch (error) {
                    console.error(error)
                    cleanup()
                    reject(error)
                }
            })
        })
    }
    async removeImageExifService(buffer: Buffer): Promise<[Buffer, sharp.WriteableMetadata]> {
        const imageWithExif = sharp(buffer, { animated: true })
        const metadata = await imageWithExif.metadata()
        const { orientation } = metadata
        const image = sharp(await imageWithExif.toBuffer(), { animated: true }) // EXIFを除去したBufferを作る
        const newMetadata: sharp.WriteableMetadata = {
            orientation, // orientationだけセット
        }
        const newBuffer = await image.withMetadata(newMetadata).toBuffer()
        return [newBuffer, newMetadata]
    }
    async mayRemoveExifExceptOrientation(
        buffer: Buffer,
        type: string
    ): Promise<[Buffer, sharp.WriteableMetadata | null]> {
        if (type == "gif") {
            // https://github.com/libvips/libvips/issues/2576
            return [buffer, null]
        }
        return await this.removeImageExifService(buffer)
    }
    async uploadHeicImage(userId: UserId, heicBuffer: Buffer): Promise<ReturnType> {
        const [jpgBuffer, size] = await this.convertHeicToJpeg(heicBuffer)
        if (size == null) {
            throw new Error("サイズが不正です")
        }
        const ret: ReturnType = []
        const type = "jpg"
        const group = FileEntity.generateGroup()
        const createdAt = new Date()
        const { width, height } = size
        const [origBuffer, metadata] = await this.mayRemoveExifExceptOrientation(jpgBuffer, type)
        ret.push({
            file: new FileEntity({
                id: -1,
                userId: userId,
                type: type,
                group: group,
                path: FileEntity.getPath(type, group),
                original: true,
                width: width,
                height: height,
                bytes: origBuffer.length,
                createdAt: createdAt,
            }),
            buffer: origBuffer,
        })

        // @ts-ignore
        const thumbnails = await this.createImageThumbnail(origBuffer, metadata, type)
        for (const thumbnail of thumbnails) {
            ret.push({
                file: new FileEntity({
                    id: -1,
                    userId: userId,
                    type: type,
                    group: group,
                    path: FileEntity.getTaggedPath(type, group, thumbnail.tag),
                    original: false,
                    width: thumbnail.metadata.width,
                    height: thumbnail.metadata.height,
                    tag: thumbnail.tag,
                    bytes: thumbnail.buffer.length,
                    createdAt: createdAt,
                }),
                buffer: thumbnail.buffer,
            })
        }
        return ret
    }
    async uploadImage(userId: UserId, inputBuffer: Buffer, type: string): Promise<ReturnType> {
        const ret: ReturnType = []
        const group = FileEntity.generateGroup()
        const createdAt = new Date()
        const size = probe.sync(inputBuffer)
        if (size == null) {
            throw new Error("サイズが不正です")
        }
        const [origBuffer, metadata] = await this.mayRemoveExifExceptOrientation(inputBuffer, type)
        const { width, height } = size
        ret.push({
            file: new FileEntity({
                id: -1,
                userId: userId,
                type: type,
                group: group,
                path: FileEntity.getPath(type, group),
                original: true,
                width: width,
                height: height,
                bytes: inputBuffer.length,
                createdAt: createdAt,
            }),
            buffer: origBuffer,
        })

        // @ts-ignore
        const thumbnails = await this.createImageThumbnail(origBuffer, metadata, type)
        for (const thumbnail of thumbnails) {
            ret.push({
                file: new FileEntity({
                    id: -1,
                    userId: userId,
                    type: type,
                    group: group,
                    path: FileEntity.getTaggedPath(type, group, thumbnail.tag),
                    original: false,
                    width: thumbnail.metadata.width,
                    height: thumbnail.metadata.height,
                    tag: thumbnail.tag,
                    bytes: thumbnail.buffer.length,
                    createdAt: createdAt,
                }),
                buffer: thumbnail.buffer,
            })
        }
        return ret
    }
    async uploadVideo(userId: UserId, videoBuffer: Buffer, type: string): Promise<ReturnType> {
        const ret: ReturnType = []
        const group = FileEntity.generateGroup()
        const createdAt = new Date()
        const [posterBuffer, resolution] = await this.extractFrameFromVideo(videoBuffer, type)
        ret.push({
            file: new FileEntity({
                id: -1,
                userId: userId,
                type: type,
                group: group,
                path: FileEntity.getPath(type, group),
                original: true,
                width: resolution.width,
                height: resolution.height,
                bytes: videoBuffer.length,
                createdAt: createdAt,
            }),
            buffer: videoBuffer,
        })

        const thumbnailType = "jpg"
        // @ts-ignore
        const thumbnails = await this.createImageThumbnail(posterBuffer, null, thumbnailType)
        for (const thumbnail of thumbnails) {
            ret.push({
                file: new FileEntity({
                    id: -1,
                    userId: userId,
                    type: type,
                    group: group,
                    path: FileEntity.getTaggedPath(thumbnailType, group, thumbnail.tag),
                    original: false,
                    bytes: thumbnail.buffer.length,
                    createdAt: createdAt,
                    width: thumbnail.metadata.width,
                    height: thumbnail.metadata.height,
                    tag: thumbnail.tag,
                }),
                buffer: thumbnail.buffer,
            })
        }
        return ret
    }
    async prepareFilesToUpload(userId: UserId, buffer: Buffer): Promise<ReturnType> {
        const fileType = await fromBuffer(buffer)
        if (fileType == null) {
            throw new Error("不正なBuffer")
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
        throw new Error("サポートされていないファイル形式です")
    }
}
