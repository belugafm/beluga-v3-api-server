import { CommonErrorMessages, ValidationError } from "../ValidationError"
import { isNumber, isString } from "../functions"

import { EntityId } from "../../types"
import { Validator } from "../Validator"

export function checkIsEntityId(value: EntityId, options: {}): void {
    if (isString(value)) {
        return
    }
    if (isNumber(value)) {
        return
    }
    throw new ValidationError(CommonErrorMessages.InvalidType)
}

export function entityId() {
    return new Validator<EntityId>({}, [checkIsEntityId])
}
