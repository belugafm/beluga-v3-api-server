import { FileEntity } from "../entity/File"

export interface IUploadMediaService {
    upload(buffer: Buffer): FileEntity[]
}
