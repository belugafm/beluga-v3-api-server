import { IStorageCommandRepository } from "../../domain/repository/command/Storage"
import { RepositoryError } from "../../domain/repository/RepositoryError"
import config from "../../config/app"
import fs from "fs"
import pathlib from "path"

export class StorageCommandRepository implements IStorageCommandRepository {
    async put(buffer: Buffer, path: string): Promise<boolean> {
        try {
            fs.writeFileSync(pathlib.join(config.storage.nfs.base_dir, path), buffer)
            return true
        } catch (error) {
            console.error(error)
            throw new RepositoryError("ファイルを保存できません")
        }
        return false
    }
}
