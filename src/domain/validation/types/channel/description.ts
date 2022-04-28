import { Options } from "../string"
import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import { checkRegexPattern } from "../../validator/string/regex"
import config from "../../../../config/app"

export function description() {
    const options: Options = {
        minLength: config.channel.description.min_length,
        maxLength: config.channel.description.max_length,
    }
    return new Validator<string>(options, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
