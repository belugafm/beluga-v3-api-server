import { isDate } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../ValidationError"

export type Options = {}
export function checkIsDate(value: number, options: Options): void {
    if (isDate(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
