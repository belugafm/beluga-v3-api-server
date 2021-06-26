import { Validator } from "../Validator"
import { checkMinLength } from "../validator/string/min_length"
import { checkMaxLength } from "../validator/string/max_length"
import { checkRegexPattern } from "../validator/string/regex"
import { checkIsString } from "../validator/string/is_string"

export type Options = {
    minLength?: number
    maxLength?: number
    regexp?: object
}
export function string(options?: Options) {
    return new Validator<string>(options || {}, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
