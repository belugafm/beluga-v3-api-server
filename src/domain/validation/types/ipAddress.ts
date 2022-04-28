import { Options } from "./string"
import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/isString"
import { checkRegexPattern } from "../validator/string/regex"

export function ipAddress() {
    const options: Options = {
        regexp: new RegExp(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
    }
    return new Validator<string>(options, [checkIsString, checkRegexPattern])
}
