import { isString } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../ValidationError"

export type Options = {
    maxLength?: number
}
export function checkMaxLength(value: string, options: Options): void {
    if (options.maxLength == null) {
        return
    }
    if (isString(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length > options.maxLength) {
        throw new ValidationError(`${options.maxLength + 1}文字以上に設定することはできません`)
    }
}
