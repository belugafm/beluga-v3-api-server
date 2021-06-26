import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/is_string"
import { checkRegexPattern } from "../validator/string/regex"
import { Options } from "./string"

export function ipAddress() {
    const options: Options = {
        regexp: new RegExp(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
    }
    return new Validator<string>(options, [checkIsString, checkRegexPattern])
}
