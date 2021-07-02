import { CommonErrorMessages, ValidationError } from "../ValidationError"
import { isNumber, isString } from "../functions"

import { Validator } from "../Validator"

function checkIsObjectId(value: any) {
    if (isNumber(value)) {
        return
    }
    if (isString(value)) {
        return
    }
    throw new ValidationError(CommonErrorMessages.InvalidType)
}
export function objectId() {
    return new Validator<EntityId>({}, [checkIsObjectId])
}
