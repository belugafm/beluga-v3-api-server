import { FileEntity } from "../../entity/File"
import { FileId } from "../../types"

export interface IFileCommandRepository {
    add(file: FileEntity): Promise<FileId>
    delete(file: FileEntity): Promise<boolean>
    update(file: FileEntity): Promise<boolean>
}
