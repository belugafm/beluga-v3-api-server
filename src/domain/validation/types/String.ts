import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkMaxLength } from "../validator/string/maxLength"
import { checkMinLength } from "../validator/string/minLength"
import { checkRegexPattern } from "../validator/string/regex"

export type Options = {
    minLength?: number
    maxLength?: number
    regexp?: object
}
export function StringValidator(options?: Options) {
    return new PropertyValidator<string>(options || {}, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
