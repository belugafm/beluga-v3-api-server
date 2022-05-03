import { IStorageCommandRepository } from "../../domain/repository/command/Storage"
import { RepositoryError } from "../../domain/repository/RepositoryError"
import { Storage } from "@google-cloud/storage"

const storage = new Storage()
// @ts-ignore
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)

export class StorageCommandRepository implements IStorageCommandRepository {
    put(buffer: Buffer, path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const blob = bucket.file(path)
                const blobStream = blob.createWriteStream()
                blobStream.on("error", (err) => {
                    throw err
                })
                blobStream.on("finish", () => {
                    resolve(true)
                })
                blobStream.end(buffer)
            } catch (error) {
                console.log(error)
                throw new RepositoryError("internal_error")
            }
        })
    }
}
