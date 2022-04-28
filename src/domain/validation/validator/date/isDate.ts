import { CommonErrorMessages, ValidationError } from "../../error"

import { isDate } from "../../functions"

export type Options = {}
export function checkIsDate(value: number, options: Options): void {
    if (isDate(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
