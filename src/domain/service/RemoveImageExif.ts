import sharp from "sharp"

export class RemoveImageExifService {
    async process(buffer: Buffer): Promise<[Buffer, sharp.WriteableMetadata]> {
        const imageWithExif = sharp(buffer, { animated: true })
        const metadata = await imageWithExif.metadata()
        const { orientation } = metadata
        const image = sharp(await imageWithExif.toBuffer(), { animated: true }) // EXIFを除去したBufferを作る
        const newMetadata: sharp.WriteableMetadata = {
            orientation, // orientationだけセット
        }
        const newBuffer = await image.withMetadata(newMetadata).toBuffer()
        return [newBuffer, newMetadata]
    }
}
