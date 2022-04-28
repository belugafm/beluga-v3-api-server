import { Options } from "./string"
import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/isString"
import { checkRegexPattern } from "../validator/string/regex"

export function url() {
    const options: Options = {
        regexp: new RegExp(/^https?:\/\/.+\..+$/),
    }
    return new Validator<string>(options, [checkIsString, checkRegexPattern])
}
