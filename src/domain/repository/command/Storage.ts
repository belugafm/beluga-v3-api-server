export interface IStorageCommandRepository {
    put(buffer: Buffer, path: string): Promise<boolean>
}
