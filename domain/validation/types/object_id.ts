import { Schema } from "../schema"
import { is_number, is_string } from "../functions"

function isObjectId(value: any) {
    if (is_number(value)) {
        return true
    }
    if (is_string(value)) {
        return true
    }
    return false
}
export function objectId() {
    return new Schema<ObjectID>({}, [isObjectId])
}
