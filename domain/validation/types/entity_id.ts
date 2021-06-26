import { Validator } from "../Validator"
import { isNumber, isString } from "../functions"
import { CommonErrorMessages, ValidationError } from "../ValidationError"

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
