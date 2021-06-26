import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/is_string"
import { checkRegexPattern } from "../validator/string/regex"
import { Options } from "./string"

export function url() {
    const options: Options = {
        regexp: new RegExp(/^https?:\/\/.+\..+$/),
    }
    return new Validator<string>(options, [checkIsString, checkRegexPattern])
}
