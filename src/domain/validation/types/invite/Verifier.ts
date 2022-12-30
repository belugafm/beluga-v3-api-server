import { Options } from "../String"
import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import { checkRegexPattern } from "../../validator/string/regex"

export function VerifierValidator() {
    const options: Options = {
        minLength: 32,
        maxLength: 32,
        regexp: new RegExp(/^[a-zA-Z0-9_]+$/),
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMinLength, checkMaxLength, checkRegexPattern])
}
