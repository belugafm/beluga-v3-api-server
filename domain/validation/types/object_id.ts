import { Validator } from "../Validator"
import { isNumber, isString } from "../functions"

function isObjectId(value: any) {
    if (isNumber(value)) {
        return true
    }
    if (isString(value)) {
        return true
    }
    return false
}
export function objectId() {
    return new Validator<EntityId>({}, [isObjectId])
}
