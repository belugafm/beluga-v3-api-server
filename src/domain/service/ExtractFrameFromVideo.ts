import extractFrames from "ffmpeg-extract-frames"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import pathlib from "path"
import tempfile from "tmp"

const asyncProbe = (path: string): Promise<ffmpeg.FfprobeData> => {
    return new Promise((resolve, reject) => {
        ffmpeg(path).ffprobe((err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}

type Resolution = {
    width: number
    height: number
}
const getSizeFromMetadata = (metadata: ffmpeg.FfprobeData): Resolution => {
    for (const stream of metadata.streams) {
        if (stream.codec_type == "video") {
            return {
                width: stream.width as number,
                height: stream.height as number,
            }
        }
    }
    throw new Error("動画が含まれていません")
}

// const takeScreenshot = (inputPath: string, outputPath: string) => {
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputPath)
//             .on("end", () => {
//                 const result = fs.readFileSync(outputPath)
//                 resolve(result)
//             })
//             .on("error", (err: any) => reject(err))
//             .takeScreenshots({ count: 1, filename: outputPath })
//     })
// }

export class ExtractFrameFromVideoService {
    process(buffer: Buffer, type: string): Promise<[Buffer, Resolution]> {
        return new Promise((resolve, reject) => {
            tempfile.dir(async (err, baseDir) => {
                if (err) {
                    reject(err)
                }
                const inputPath = pathlib.join(baseDir, `input.${type}`)
                const formattedOutputPath = pathlib.join(baseDir, "output_%d.jpg")
                const outputPath = pathlib.join(baseDir, "output_1.jpg")
                const cleanup = () => {
                    fs.rmSync(baseDir, { recursive: true })
                }
                try {
                    fs.writeFileSync(inputPath, buffer)
                    const metadata = await asyncProbe(inputPath)
                    const size = getSizeFromMetadata(metadata)
                    await extractFrames({
                        input: inputPath,
                        output: formattedOutputPath,
                        offsets: [0],
                    })
                    const resultBuffer = fs.readFileSync(outputPath)
                    cleanup()
                    resolve([resultBuffer, size])
                } catch (error) {
                    console.error(error)
                    cleanup()
                    reject(error)
                }
            })
        })
    }
}
