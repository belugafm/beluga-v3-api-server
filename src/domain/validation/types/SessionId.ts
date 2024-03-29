import { Options } from "./String"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkMaxLength } from "../validator/string/maxLength"

export function SessionIdValidator() {
    const options: Options = {
        maxLength: 256,
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMaxLength])
}
