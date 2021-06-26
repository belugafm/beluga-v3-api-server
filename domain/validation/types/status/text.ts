import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/is_string"
import { checkMinLength } from "../../validator/string/min_length"
import { checkMaxLength } from "../../validator/string/max_length"
import { Options } from "../string"
import config from "../../../../config/app"

export function text() {
    const options: Options = {
        minLength: config.status.text.min_length,
        maxLength: config.status.text.max_length,
    }
    return new Validator<string>(options, [checkIsString, checkMinLength, checkMaxLength])
}
