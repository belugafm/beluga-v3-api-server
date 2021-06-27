import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/is_string"
import { checkMinLength } from "../../validator/string/min_length"
import { checkRegexPattern } from "../../validator/string/regex"
import { checkMaxLength } from "../../validator/string/max_length"
import { Options } from "../string"
import config from "../../../../config/app"

export function url() {
    const options: Options = {
        minLength: config.user.url.min_length,
        maxLength: config.user.url.max_length,
        regexp: new RegExp(/^https?:\/\/.+\..+$/),
    }
    return new Validator<string>(options, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
