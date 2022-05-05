import { File, PrismaClient } from "@prisma/client"
import { FileId, UserId } from "../../../../domain/types"
import { IFileQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/File"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"
import { isInteger, isString } from "../../../../domain/validation"

import { FileEntity } from "../../../../domain/entity/File"
import { prisma } from "../client"

export function toEntity(file: File) {
    return new FileEntity({
        id: file.id,
        path: file.path,
        type: file.type,
        userId: file.userId,
        bytes: file.bytes,
        original: file.original,
        group: file.group,
        createdAt: file.createdAt,
        refCount: file.refCount,
        width: file.width,
        height: file.height,
        tag: file.tag,
    })
}

function getSortOrder(sortOrderString: typeof SortOrder[keyof typeof SortOrder]) {
    if (sortOrderString == "descending") {
        return "desc"
    }
    if (sortOrderString == "ascending") {
        return "asc"
    }
    throw new RepositoryError("Invalid `sortOrder`")
}

function getSortBy(sortByString: typeof SortBy[keyof typeof SortBy]) {
    if (sortByString == SortBy.CreatedAt) {
        return "createdAt"
    }
    if (sortByString == SortBy.RefCount) {
        return "refCount"
    }
    throw new RepositoryError("Invalid `sortOrder`")
}

export class FileQueryRepository implements IFileQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(fileId: FileId): Promise<FileEntity | null> {
        try {
            if (isInteger(fileId) !== true) {
                throw new RepositoryError("`fileId` must be a number")
            }
            const file = await this._prisma.file.findUnique({
                where: {
                    id: fileId,
                },
            })
            if (file == null) {
                return null
            }
            return toEntity(file)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByPath(path: string): Promise<FileEntity | null> {
        try {
            if (isString(path) !== true) {
                throw new RepositoryError("`path` must be a string")
            }
            const file = await this._prisma.file.findUnique({
                where: {
                    path,
                },
            })
            if (file == null) {
                return null
            }
            return toEntity(file)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<FileEntity[]> {
        try {
            if (isInteger(userId) !== true) {
                throw new RepositoryError("`userId` must be a number")
            }
            const files = await this._prisma.file.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    [getSortBy(sortBy)]: getSortOrder(sortOrder),
                },
            })
            return files.map((file) => toEntity(file))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
