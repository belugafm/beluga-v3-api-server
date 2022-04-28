import { isString } from "../domain/validation"

export const getRemoteIpAddress = (headers: any) => {
    const xForwardedFor: string = headers["x-forwarded-for"]
    if (isString(xForwardedFor) == false) {
        throw new Error("ユーザーのIPアドレスを検出できません")
    }
    const parts = xForwardedFor.split(",")
    // TODO: 実際は末尾ではないのでちゃんと実装する
    return parts[parts.length - 1]
}
