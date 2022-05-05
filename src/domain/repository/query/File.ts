import { FileId, UserId } from "../../types"

import { FileEntity } from "../../entity/File"

export const SortBy = {
    CreatedAt: "created_at",
    RefCount: "ref_count",
} as const

export const SortOrder = {
    Ascending: "ascending",
    Descending: "descending",
} as const

export interface IFileQueryRepository {
    findById(fileId: FileId): Promise<FileEntity | null>
    findByPath(path: string): Promise<FileEntity | null>
    findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<FileEntity[]>
}
