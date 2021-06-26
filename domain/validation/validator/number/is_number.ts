import { isNumber } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../ValidationError"

export type Options = {}
export function checkIsNumber(value: number, options: Options): void {
    if (isNumber(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
