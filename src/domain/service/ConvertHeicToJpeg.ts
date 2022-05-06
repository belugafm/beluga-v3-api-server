import { execSync } from "child_process"
import fs from "fs"
import pathlib from "path"
import probe from "probe-image-size"
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
                    if (fs.existsSync(inputPath)) {
                        fs.rmSync(inputPath)
                    }
                    if (fs.existsSync(outputPath)) {
                        fs.rmSync(outputPath)
                    }
                    fs.rmdirSync(baseDir)
                }
                try {
                    fs.writeFileSync(inputPath, heicBuffer)
                    execSync(`heif-convert ${inputPath} ${outputPath}`)
                    const jpgBuffer = fs.readFileSync(outputPath)
                    const size = probe.sync(jpgBuffer)
                    if (size == null) {
                        throw new Error("変換できません")
                    }
                    cleanup()
                    resolve([jpgBuffer, size])
                } catch (error) {
                    console.error(error)
                    cleanup()
                    reject(error)
                }
            })
        })
    }
}
