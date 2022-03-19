import { Options } from "./string"
import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/isString"
import { checkMaxLength } from "../validator/string/maxLength"

export function sessionId() {
    const options: Options = {
        maxLength: 256,
    }
    return new Validator<string>(options, [checkIsString, checkMaxLength])
}
