import { PropertyValidator } from "../PropertyValidator"
import { ValidationError } from "../error"
// import config from "../../../config/app"
// import { fromBuffer } from "file-type"

export type Options = {
    minNumByte: number
    maxNumByte: number
}
export async function checkIsBuffer(value: Buffer, options: Options): Promise<void> {
    if (value instanceof Buffer == false) {
        throw new ValidationError("ファイルはBufferにしてください")
    }
    // const numBytes = buf.length
    // if (numBytes < options.minNumByte) {
    //     throw new ValidationError("ファイルサイズが小さすぎます")
    // }
    // if (options.maxNumByte < numBytes) {
    //     throw new ValidationError("ファイルサイズが大きすぎます")
    // }
    // const fileType = await fromBuffer(buf)
    // if (fileType == null) {
    //     throw new ValidationError("不正なファイルです")
    // }
}
export function BufferValidator(options?: Options) {
    return new PropertyValidator<Buffer>(options || {}, [checkIsBuffer])
}
