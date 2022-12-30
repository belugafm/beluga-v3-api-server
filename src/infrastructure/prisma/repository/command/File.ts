import { File, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { assignChangeEventHandlerProperties, ChangeEventHandler } from "../ChangeEventHandler"
import { FileEntity } from "../../../../domain/entity/File"
import { FileId } from "../../../../domain/types"
import { IFileCommandRepository } from "../../../../domain/repository/command/File"
import { prisma } from "../client"

export function hasChanged(a: File, b: File) {
    return !(
        a.refCount === b.refCount &&
        a.type === b.type &&
        a.path === b.path &&
        a.group === b.group &&
        a.original === b.original &&
        a.width === b.width &&
        a.height === b.height &&
        a.userId === b.userId &&
        a.tag === b.tag &&
        a.createdAt?.getTime() === b.createdAt?.getTime() &&
        a.bytes === b.bytes
    )
}

export class FileCommandRepository extends ChangeEventHandler implements IFileCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super()
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(file: FileEntity): Promise<FileId> {
        if (file instanceof FileEntity !== true) {
            throw new RepositoryError("`file` must be an instance of FileEntity")
        }
        try {
            const result = await this._prisma.file.create({
                data: {
                    type: file.type,
                    path: file.path,
                    group: file.group,
                    original: file.original,
                    userId: file.userId,
                    refCount: file.refCount,
                    createdAt: file.createdAt,
                    bytes: file.bytes,
                    width: file.width,
                    height: file.height,
                    tag: file.tag,
                },
            })
            return result.id
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async update(file: FileEntity): Promise<boolean> {
        if (file instanceof FileEntity !== true) {
            throw new RepositoryError("`file` must be an instance of FileEntity")
        }
        try {
            const origFile = await this._prisma.file.findUnique({
                where: {
                    id: file.id,
                },
            })
            if (origFile == null) {
                throw new RepositoryError(`File not found (id=${file.id}, path='${file.path}')`)
            }
            const updatedFile = await this._prisma.file.update({
                where: {
                    id: file.id,
                },
                data: {
                    type: file.type,
                    path: file.path,
                    group: file.group,
                    original: file.original,
                    userId: file.userId,
                    refCount: file.refCount,
                    createdAt: file.createdAt,
                    bytes: file.bytes,
                    width: file.width,
                    height: file.height,
                    tag: file.tag,
                },
            })
            if (hasChanged(origFile, updatedFile)) {
                await this.emitChanges(file.id)
                return true
            }
            return false
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(file: FileEntity): Promise<boolean> {
        if (file instanceof FileEntity !== true) {
            throw new RepositoryError("`file` must be an instance of FileEntity")
        }
        try {
            await this._prisma.file.delete({
                where: {
                    id: file.id,
                },
            })
            await this.emitChanges(file.id)
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
assignChangeEventHandlerProperties(FileCommandRepository)
