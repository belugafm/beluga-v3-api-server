import cookie from "cookie"
import multipart from "./multipart"
import turbo from "turbo-http"

export class Request {
    _req: turbo.Request
    headers: { [key: string]: string }
    cookies: any
    url: string = ""
    query: any = null
    body: any
    constructor(req: turbo.Request) {
        this._req = req
        Object.assign(this, req)
        this.headers = convert_raw_headers_to_dict(req._options.headers)
        this.cookies = this.headers["cookie"] ? cookie.parse(this.headers["cookie"]) : {}
    }
    onData(handler: (buffer: Buffer, start: number, length: number) => void) {
        this._req.ondata = handler
    }
    onEnd(handler: () => void) {
        this._req.onend = handler
    }
}

type CookieOptions = {
    maxAge?: number
    expires?: Date
    path?: string
    domain?: string
    secure?: boolean
    httpOnly?: boolean
}

export class Response {
    _res: turbo.Response
    constructor(res: turbo.Response) {
        Object.assign(this, res)
        this._res = res
    }
    end() {
        this._res.end()
    }
    write(buf: Buffer) {
        this._res.write(buf)
    }
    setHeader(name: string, value: string) {
        this._res.setHeader(name, value)
    }
    setCookie(name: string, value: string, opt?: CookieOptions) {
        opt = opt || {}
        const cookie_str = cookie.serialize(name, value, opt)
        this.setHeader("Set-Cookie", cookie_str)
    }
    setStatusCode(code: number) {
        this._res.statusCode = code
    }
}

export function read_body(req: Request): Promise<{ [key: string]: Buffer | string | number }> {
    return new Promise((resolve, reject) => {
        const headers = req.headers ? req.headers : {}
        const chunks: Buffer[] = []
        req.onData((buffer, start, length) => {
            const bodyChunk = buffer.slice(start, start + length)
            const data = Buffer.alloc(length)
            bodyChunk.copy(data, 0, 0, length)
            chunks.push(data)
        })
        req.onEnd(() => {
            try {
                const buffer = Buffer.concat(chunks)
                if (typeof headers["content-type"] !== "string") {
                    reject(new Error("Content-Typeが不正です"))
                }
                const parts = headers["content-type"].split(";")
                const contentType = parts[0]
                if (contentType === "application/json") {
                    return resolve(JSON.parse(buffer.toString()))
                }
                // multipart/form-dataの場合ヘッダは
                // Content-Type: multipart/form-data; boundary=----XXXXXXXXXXXXX
                // のようになるため前方一致で判別する
                // XXXXXXXXXXXXXの部分がboundary
                if (contentType.indexOf("multipart/form-data") === 0) {
                    const boundary = parts[1].split("boundary=")[1]
                    const items = multipart.parse(buffer, boundary)
                    const data: { [key: string]: Buffer | string | number } = {}
                    items.forEach((item) => {
                        if (item.name == "file") {
                            // ファイルアップロードの場合バイナリデータを直接格納
                            data[item.name] = item.data
                        } else {
                            data[item.name] = item.data.toString()
                        }
                    })
                    return resolve(data)
                }
                if (contentType === "application/x-www-form-urlencoded") {
                    const encodedStr = buffer.toString()
                    if (encodedStr.indexOf("=") == -1) {
                        return resolve({})
                    }
                    const parts = encodedStr.split("&")
                    const data: { [key: string]: string } = {}
                    parts.forEach((part) => {
                        const kv = part.split("=")
                        const key = kv[0]
                        const value = decodeURIComponent(kv[1])
                        data[key] = value
                    })
                    return resolve(data)
                }
                reject(new Error("Content-Typeが不正です"))
            } catch (error) {
                console.error(error)
                if (error instanceof Error) {
                    reject(new Error(error.toString()))
                } else {
                    reject(new Error("unknown_error"))
                }
            }
        })
    })
}

function convert_raw_headers_to_dict(header_strings: string[]) {
    // header_stringsの中身はこういう形になっている
    // [
    //     "Host",
    //     "localhost:8080",
    //     "Connection",
    //     "keep-alive",
    //     "Pragma",
    //     "no-cache",
    //     "Cache-Control",
    //     "no-cache"
    // ]
    const num = Math.ceil(header_strings.length / 2) // 実際の要素の数は半分
    const headers: { [key: string]: string } = {}
    for (let k = 0; k < num; k++) {
        const key = header_strings[k * 2].toLowerCase() // 小文字に統一しておく
        const value = header_strings[k * 2 + 1]
        headers[key] = value
    }
    return headers
}
