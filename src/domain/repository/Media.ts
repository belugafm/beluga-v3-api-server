import { FileEntity } from "../entity/File"
import { UserId } from "../types"

export type ReturnType = {
    file: FileEntity
    buffer: Buffer
}[]
export interface IMediaRepository {
    prepareFilesToUpload(userId: UserId, buffer: Buffer): Promise<ReturnType>
}
