import { CommonErrorMessages, ValidationError } from "../../error"

import { isNumber } from "../../functions"

export type Options = {}
export function checkIsNumber(value: number, options: Options): void {
    if (isNumber(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
