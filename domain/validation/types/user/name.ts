import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/is_string"
import { checkMinLength } from "../../validator/string/min_length"
import { checkMaxLength } from "../../validator/string/max_length"
import { checkRegexPattern } from "../../validator/string/regex"
import { Options } from "../string"
import config from "../../../../config/app"

export function name() {
    const options: Options = {
        minLength: config.user.name.min_length,
        maxLength: config.user.name.max_length,
        regexp: config.user.name.regexp,
    }
    return new Validator<string>(options, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
