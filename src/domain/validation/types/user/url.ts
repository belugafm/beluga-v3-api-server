import { Options } from "../string"
import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import { checkRegexPattern } from "../../validator/string/regex"
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
