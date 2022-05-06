import { execSync } from "child_process"
import fs from "fs"
import pathlib from "path"
import probe from "probe-image-size"
import sharp from "sharp"
import tempfile from "tmp"

export class ConvertHeicToJpegService {
    async process(heicBuffer: Buffer): Promise<[Buffer, probe.ProbeResult]> {
        return new Promise((resolve, reject) => {
            tempfile.dir(async (err, baseDir) => {
                if (err) {
                    reject(err)
                }
                const inputPath = pathlib.join(baseDir, "input.heic")
                const outputPath = pathlib.join(baseDir, "output.jpg")
                const cleanup = () => {
                    fs.rmSync(baseDir, { recursive: true })
                }
                try {
                    const heicWithExif = sharp(heicBuffer)
                    const metadata = await heicWithExif.metadata()
                    const { orientation } = metadata
                    const newMetadata: sharp.WriteableMetadata = {
                        orientation, // orientationだけセット
                    }
                    fs.writeFileSync(inputPath, heicBuffer)
                    execSync(`heif-convert ${inputPath} ${outputPath}`)
                    const jpegBuffer = sharp(fs.readFileSync(outputPath))
                    const jpegWithOrientationBuffer = await jpegBuffer.withMetadata(newMetadata).toBuffer()
                    const size = probe.sync(jpegWithOrientationBuffer)
                    if (size == null) {
                        throw new Error("変換できません")
                    }
                    cleanup()
                    resolve([jpegWithOrientationBuffer, size])
                } catch (error) {
                    console.error(error)
                    cleanup()
                    reject(error)
                }
            })
        })
    }
}
