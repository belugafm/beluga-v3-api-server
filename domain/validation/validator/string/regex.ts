import { isString } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../ValidationError"

export type Options = {
    regexp?: RegExp
}
export function checkRegexPattern(value: string, options: Options): void {
    if (options.regexp == null) {
        return
    }
    if (isString(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (options.regexp.test(value) !== true) {
        throw new ValidationError("使用できない文字が含まれています")
    }
}
