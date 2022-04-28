import { Options } from "../string"
import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import { checkRegexPattern } from "../../validator/string/regex"
import config from "../../../../config/app"

export function text() {
    const options: Options = {
        minLength: config.message.text.min_length,
        maxLength: config.message.text.max_length,
    }
    return new Validator<string>(options, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
