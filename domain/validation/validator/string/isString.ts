import { CommonErrorMessages, ValidationError } from "../../error"

import { isString } from "../../functions"

export type Options = {}
export function checkIsString(value: string, options: Options): void {
    if (isString(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
