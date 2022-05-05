import config from "../../config/app"
import sharp from "sharp"

export class CreateImageThumbnailService {
    private origBuffer: Buffer
    constructor(origBuffer: Buffer) {
        this.origBuffer = origBuffer
        this.origBuffer
    }
    async process(metadata: sharp.WriteableMetadata | null, outputFormat: keyof sharp.FormatEnum) {
        const ret: { buffer: Buffer; metadata: sharp.OutputInfo; tag: string }[] = []
        const withMetadata = (s: sharp.Sharp) => {
            if (metadata) {
                return s.withMetadata(metadata)
            }
            return s
        }
        for (const task of config.file.thumbnail_sizes) {
            const args: sharp.ResizeOptions = {
                fit: task.fit as keyof sharp.FitEnum,
            }
            if (task.width > 0) {
                args["width"] = task.width
            }
            if (task.height > 0) {
                args["height"] = task.height
            }
            const { data, info } = await withMetadata(
                sharp(this.origBuffer).resize(args).toFormat(outputFormat)
            ).toBuffer({ resolveWithObject: true })
            ret.push({
                buffer: data,
                metadata: info,
                tag: task.tag,
            })
        }
        return ret
    }
}
