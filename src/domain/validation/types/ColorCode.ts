import { Options } from "./String"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkRegexPattern } from "../validator/string/regex"

export function ColorCodeValidator() {
    const options: Options = {
        regexp: new RegExp(/^#[0-9a-fA-F]{6}$/),
    }
    return new PropertyValidator<string>(options, [checkIsString, checkRegexPattern])
}
