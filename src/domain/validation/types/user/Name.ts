import { Options } from "../String"
import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import { checkRegexPattern } from "../../validator/string/regex"
import config from "../../../../config/app"

export function NameValidator() {
    const options: Options = {
        minLength: config.user.name.min_length,
        maxLength: config.user.name.max_length,
        regexp: config.user.name.regexp,
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMinLength, checkMaxLength, checkRegexPattern])
}
