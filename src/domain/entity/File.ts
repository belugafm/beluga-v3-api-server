import { FileId, FileJsonObjectT, UserId } from "../types"
import { IsAnyString, IsBoolean, IsDate, IsFileId, IsFileType, IsInteger, IsUserId } from "../validation/decorators"

import { Entity } from "./Entity"
import config from "../../config/app"
import crypto from "crypto"
import pathlib from "path"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidUserId: "invalid_user_id",
    InvalidPath: "invalid_path",
    InvalidType: "invalid_type",
    InvalidBytes: "invalid_bytes",
    InvalidGroup: "invalid_group",
    InvalidRefCount: "invalid_ref_count",
    InvalidCreatedAt: "invalid_created_at",
    InvalidOriginal: "invalid_original",
    InvalidBufferSize: "invalid_buffer_size",
    InvalidBufferType: "invalid_buffer_type",
    InvalidHeight: "invalid_height",
    InvalidWidth: "invalid_width",
    InvalidTag: "invalid_tag",
} as const

const generateRandomString = (length: number): string => {
    const S = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return Array.from(crypto.randomFillSync(new Uint8Array(length)))
        .map((n) => S[n % S.length])
        .join("")
}

export class FileEntity extends Entity {
    @IsFileId({ errorCode: ErrorCodes.InvalidId })
    id: FileId

    @IsUserId({ errorCode: ErrorCodes.InvalidUserId })
    userId: UserId

    @IsAnyString({ errorCode: ErrorCodes.InvalidPath })
    path: string

    @IsAnyString({ errorCode: ErrorCodes.InvalidGroup })
    group: string

    @IsFileType({ errorCode: ErrorCodes.InvalidType })
    type: string

    @IsInteger({ minValue: 1 }, { errorCode: ErrorCodes.InvalidBytes })
    bytes: number

    @IsInteger({ minValue: 0 }, { errorCode: ErrorCodes.InvalidRefCount })
    refCount: number

    @IsBoolean({ errorCode: ErrorCodes.InvalidOriginal })
    original: boolean

    @IsDate({ errorCode: ErrorCodes.InvalidCreatedAt })
    createdAt: Date

    @IsInteger({ minValue: 0 }, { nullable: true, errorCode: ErrorCodes.InvalidRefCount })
    width: number | null

    @IsInteger({ minValue: 0 }, { nullable: true, errorCode: ErrorCodes.InvalidRefCount })
    height: number | null

    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidTag })
    tag: string | null

    constructor(
        params: {
            id: FileEntity["id"]
            userId: FileEntity["userId"]
            type: FileEntity["type"]
            path: FileEntity["path"]
            group: FileEntity["group"]
            bytes: FileEntity["bytes"]
            original: FileEntity["original"]
            createdAt: FileEntity["createdAt"]
        } & Partial<FileEntity>
    ) {
        super()
        this.id = params.id
        this.userId = params.userId
        this.type = params.type
        this.path = params.path
        this.bytes = params.bytes
        this.group = params.group
        this.createdAt = params.createdAt
        this.original = params.original
        this.refCount = params.refCount != null ? params.refCount : 0
        this.width = params.width != null ? params.width : null
        this.height = params.height != null ? params.height : null
        this.tag = params.tag != null ? params.tag : null
    }
    static generateGroup(): string {
        return generateRandomString(15)
    }
    static getPath(type: string, group: string): string {
        return pathlib.join(config.file.base_dir, `${group}.${type}`)
    }
    static getTaggedPath(type: string, group: string, tag: string): string {
        return pathlib.join(config.file.base_dir, `${group}.${type}:${tag}`)
    }
    static getProtocol() {
        return config.server.https ? "https://" : "http://"
    }
    static getMediaUrlRegexp() {
        const baseUrl =
            FileEntity.getProtocol().replace("/", "\\/") + config.server.domain + "\\/" + config.file.base_dir
        const ext = config.file.allowed_file_types.image.concat(config.file.allowed_file_types.video).join("|")
        return new RegExp(`${baseUrl}\\/[0-9a-zA-Z]{15}\\.(${ext})`, "g")
    }
    static getPathFromUrl(url: string) {
        return url.replace(FileEntity.getProtocol() + config.server.domain, "")
    }
    toJsonObject(): FileJsonObjectT {
        return {
            id: this.id,
            user_id: this.userId,
            group: this.group,
            path: FileEntity.getProtocol() + pathlib.join(config.server.domain, this.path),
            original: this.original,
            type: this.type,
            bytes: this.bytes,
            ref_count: this.refCount,
            created_at: this.createdAt,
            width: this.width,
            height: this.height,
            tag: this.tag,
        }
    }
}
