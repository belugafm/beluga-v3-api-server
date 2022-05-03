import { PropertyValidator } from "../PropertyValidator"
import { ValidationError } from "../error"
import config from "../../../config/app"
import { fromBuffer } from "file-type"

export type Options = {
    minNumByte: number
    maxNumByte: number
}
export async function checkIsBufferList(value: Buffer[], options: Options): Promise<void> {
    if (Array.isArray(value) == false) {
        throw new ValidationError("ファイルを配列で指定してください")
    }
    if (value.length == 0) {
        throw new ValidationError("ファイルを一つ以上指定してください")
    }
    for (const buf of value) {
        if (buf instanceof Buffer == false) {
            throw new ValidationError("ファイルはBufferにしてください")
        }
        const numBytes = buf.length
        if (numBytes < options.minNumByte) {
            throw new ValidationError("ファイルサイズが小さすぎます")
        }
        if (options.maxNumByte < numBytes) {
            throw new ValidationError("ファイルサイズが大きすぎます")
        }
        const fileType = await fromBuffer(buf)
        if (fileType == null) {
            throw new ValidationError("不正なファイルです")
        }
    }
}
export function files(
    options: Options = {
        minNumByte: config.file.minNumByte,
        maxNumByte: config.file.maxNumByte,
    }
) {
    return new PropertyValidator<Buffer[]>(options || {}, [checkIsBufferList])
}
