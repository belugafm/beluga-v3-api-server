import { FileEntity } from "../entity/File"
import { IFileQueryRepository } from "../repository/query/File"

export const ErrorCodes = {
    RateLimitExceeded: "rate_limit_exceeded",
} as const

export class FindFilesInMessageTextService {
    private fileRepository: IFileQueryRepository
    constructor(fileRepository: IFileQueryRepository) {
        this.fileRepository = fileRepository
    }
    async find(text: string) {
        const ret: FileEntity[] = []
        const regexp = FileEntity.getMediaUrlRegexp()
        const results = text.match(regexp)
        if (results == null) {
            return []
        }
        for (const url of results) {
            const path = FileEntity.getPathFromUrl(url)
            const file = await this.fileRepository.findByPath(path)
            if (file == null) {
                continue
            }
            if (file.original !== true) {
                continue
            }
            ret.push(file)
        }
        return ret
    }
}
