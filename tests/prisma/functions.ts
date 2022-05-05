import crypto from "crypto"

export function sleep(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null)
        }, sec * 1000)
    })
}

export const generateRandomName = (length: number): string => {
    const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from(crypto.randomFillSync(new Uint8Array(length)))
        .map((n) => S[n % S.length])
        .join("")
}

export const generateRandomIpAddress = (): string => {
    const a = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    const c = Math.floor(Math.random() * 256)
    const d = Math.floor(Math.random() * 256)
    return `${a}.${b}.${c}.${d}`
}
