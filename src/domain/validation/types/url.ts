import { Options } from "./string"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkRegexPattern } from "../validator/string/regex"

export function url() {
    const options: Options = {
        regexp: new RegExp(/^https?:\/\/.+\..+$/),
    }
    return new PropertyValidator<string>(options, [checkIsString, checkRegexPattern])
}
