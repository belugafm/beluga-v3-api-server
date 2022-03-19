import { isString } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../ValidationError"

export type Options = {}
export function checkIsString(value: string, options: Options): void {
    if (isString(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
