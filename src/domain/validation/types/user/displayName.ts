import { Options } from "../string"
import { Validator } from "../../Validator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import config from "../../../../config/app"

export function displayName() {
    const options: Options = {
        minLength: config.user.display_name.min_length,
        maxLength: config.user.display_name.max_length,
    }
    return new Validator<string>(options, [checkIsString, checkMinLength, checkMaxLength])
}
