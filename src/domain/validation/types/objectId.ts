import { CommonErrorMessages, ValidationError } from "../error"
import { isInteger, isString } from "../functions"

import { EntityId } from "../../types"
import { Validator } from "../Validator"

function checkIsObjectId(value: any) {
    if (isInteger(value)) {
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
