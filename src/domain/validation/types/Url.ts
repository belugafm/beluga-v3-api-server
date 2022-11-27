import { Options } from "./String"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkRegexPattern } from "../validator/string/regex"

export function UrlValidator() {
    const options: Options = {
        regexp: new RegExp(/^https?:\/\/.+\..+$/),
    }
    return new PropertyValidator<string>(options, [checkIsString, checkRegexPattern])
}
