import { CommonErrorMessages, ValidationError } from "../error"
import { isInteger, isString } from "../functions"

import { EntityId } from "../../types"
import { PropertyValidator } from "../PropertyValidator"

function checkIsObjectId(value: any) {
    if (isInteger(value)) {
        return
    }
    if (isString(value)) {
        return
    }
    throw new ValidationError(CommonErrorMessages.InvalidType)
}
export function ObjectIdValidator() {
    return new PropertyValidator<EntityId>({}, [checkIsObjectId])
}
