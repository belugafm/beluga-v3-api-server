import { CommonErrorMessages, ValidationError } from "../../error"

import { isString } from "../../functions"

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
    // value.lengthだと絵文字の文字数を正確にカウントできないので注意
    if (Array.from(value).length > options.maxLength) {
        throw new ValidationError(`${options.maxLength + 1}文字以上に設定することはできません`)
    }
}
