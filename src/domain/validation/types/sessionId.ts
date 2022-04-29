import { Options } from "./string"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkMaxLength } from "../validator/string/maxLength"

export function sessionId() {
    const options: Options = {
        maxLength: 256,
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMaxLength])
}
