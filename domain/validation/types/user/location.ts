import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/is_string"
import { checkMinLength } from "../../validator/string/min_length"
import { checkMaxLength } from "../../validator/string/max_length"
import { Options } from "../string"
import config from "../../../../config/app"

export function location() {
    const options: Options = {
        minLength: config.user.location.min_length,
        maxLength: config.user.location.max_length,
    }
    return new Validator<string>(options, [checkIsString, checkMinLength, checkMaxLength])
}
