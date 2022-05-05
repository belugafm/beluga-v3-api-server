import sharp from "sharp"

export class ConvertHeicToJpegService {
    private origBuffer: Buffer
    constructor(origBuffer: Buffer) {
        this.origBuffer = origBuffer
        this.origBuffer
    }
    async process(metadata: sharp.WriteableMetadata | null) {
        const withMetadata = (s: sharp.Sharp) => {
            if (metadata) {
                return s.withMetadata(metadata)
            }
            return s
        }
        return await withMetadata(sharp(this.origBuffer).toFormat("jpg")).toBuffer()
    }
}
