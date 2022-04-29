import { Options } from "../string"
import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import { checkRegexPattern } from "../../validator/string/regex"
import config from "../../../../config/app"

export function uniqueName() {
    const options: Options = {
        minLength: config.channel.unique_name.min_length,
        maxLength: config.channel.unique_name.max_length,
        regexp: config.channel.unique_name.regexp,
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMinLength, checkMaxLength, checkRegexPattern])
}
