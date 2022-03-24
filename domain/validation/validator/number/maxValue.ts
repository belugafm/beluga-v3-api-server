import { CommonErrorMessages, ValidationError } from "../../error"

import { isNumber } from "../../functions"

export type Options = {
    maxValue?: number
}
export function checkMaxValue(value: number, options: Options): void {
    if (options.maxValue == null) {
        return
    }
    if (isNumber(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value > options.maxValue) {
        throw new ValidationError(`${options.maxValue + 1}以上の値に設定することはできません`)
    }
}
