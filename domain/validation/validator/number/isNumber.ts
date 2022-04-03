import { CommonErrorMessages, ValidationError } from "../../error"

import { isInteger } from "../../functions"

export type Options = {}
export function checkIsInteger(value: number, options: Options): void {
    if (isInteger(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
