import { CommonErrorMessages, ValidationError } from "../../error"

import { isString } from "../../functions"

export type Options = {
    minLength?: number
}
export function checkMinLength(value: string, options: Options): void {
    if (options.minLength == null) {
        return
    }
    if (isString(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length < options.minLength) {
        throw new ValidationError(`${options.minLength}文字以上に設定してください`)
    }
}
