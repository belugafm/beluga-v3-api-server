import { Options } from "../String"
import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import { checkRegexPattern } from "../../validator/string/regex"
import config from "../../../../config/app"

export function NameValidator() {
    const options: Options = {
        minLength: config.channel_group.name.min_length,
        maxLength: config.channel_group.name.max_length,
        regexp: config.channel_group.name.regexp,
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMinLength, checkMaxLength, checkRegexPattern])
}
