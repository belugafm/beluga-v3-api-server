import { Options } from "./string"
import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/is_string"
import { checkMaxLength } from "../validator/string/max_length"

export function sessionId() {
    const options: Options = {
        maxLength: 128,
    }
    return new Validator<string>(options, [checkIsString, checkMaxLength])
}
