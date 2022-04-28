import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/isString"
import { checkMaxLength } from "../validator/string/maxLength"
import { checkMinLength } from "../validator/string/minLength"
import { checkRegexPattern } from "../validator/string/regex"

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
