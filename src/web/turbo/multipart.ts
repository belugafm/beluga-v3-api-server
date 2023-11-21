interface FormData {
    filename?: string
    type?: string
    name: string
    data: Buffer
}

function parse(bodyBuffer: Buffer, boundary: string): FormData[] {
    let lastLine = ""
    let contentDisposition = ""
    let contentType = undefined
    let state = 0
    let buffer = []
    const ret: FormData[] = []
    for (let k = 0; k < bodyBuffer.length; k++) {
        const byte = bodyBuffer[k]
        const prevByte = k > 0 ? bodyBuffer[k - 1] : null
        const newlineDetected = byte === 0x0a && prevByte === 0x0d ? true : false
        const isNewlineChar = byte === 0x0a || byte === 0x0d ? true : false
        if (isNewlineChar === false) {
            lastLine += String.fromCharCode(byte)
        }
        if (state === 0 && newlineDetected) {
            if ("--" + boundary === lastLine) {
                state = 1
            }
            lastLine = ""
        } else if (state === 1 && newlineDetected) {
            contentDisposition = lastLine
            // input typeがtextやpasswordのときは↓
            // Content-Disposition: form-data; name="hoge
            // input typeがfileのときは↓
            // Content-Disposition: orm-data; name="hoge"; filename="beluga.jpg"
            // のようになっている
            // fileの場合はfilenameを指定する必要があり、指定されていない場合parseできない
            state = 2
            if (contentDisposition.indexOf("filename") === -1) {
                // Content-Typeが存在しないのでスキップ
                state = 3
            }
            lastLine = ""
        } else if (state === 2 && newlineDetected) {
            contentType = lastLine
            state = 3
            lastLine = ""
        } else if (state === 3 && newlineDetected) {
            state = 4
            buffer = []
            lastLine = ""
        } else if (state === 4) {
            if (lastLine.length > boundary.length + 4) {
                lastLine = ""
            }
            if (lastLine === "--" + boundary) {
                // boundaryを除くデータを取得
                const bodyLength = buffer.length - lastLine.length
                const bytes = buffer.slice(0, bodyLength - 1)
                const part = { contentDisposition, contentType, bytes }
                ret.push(process(part))
                buffer = []
                lastLine = ""
                state = 5
                contentDisposition = ""
                contentType = undefined
            } else {
                buffer.push(byte)
            }
            if (newlineDetected) {
                lastLine = ""
            }
        } else if (state === 5) {
            if (newlineDetected) {
                state = 1
            }
        }
    }
    return ret
}

function process(part: { contentDisposition: string; contentType: string | undefined; bytes: number[] }): FormData {
    const contentDisposition = part.contentDisposition.split(";")
    // content_dispositionは以下のようになっている
    // [
    //   'Content-Disposition: form-data',
    //   ' name="hoge"',
    //   ' filename="beluga.jpg"'
    // ]
    const name = contentDisposition[1].split("=")[1].replace(/"/g, "") // 送信時のformのinputタグのname属性
    const data = Buffer.from(part.bytes)
    console.log("data:", data)
    const type = part.contentType ? part.contentType.split(":")[1].trim() : undefined
    const filenameField = contentDisposition[2]
    if (filenameField) {
        const rawFilename = filenameField.split("=")[1]
        const filename = JSON.parse(rawFilename.trim())
        return {
            name,
            filename,
            type,
            data,
        }
    } else {
        return {
            name,
            type,
            data,
        }
    }
}

export default { parse }
