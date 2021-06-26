import { isNumber } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../ValidationError"

export type Options = {
    minValue?: number
}
export function checkMinValue(value: number, options: Options): void {
    if (options.minValue == null) {
        return
    }
    if (isNumber(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value < options.minValue) {
        throw new ValidationError(`${options.minValue}以上の値に設定してください`)
    }
}
