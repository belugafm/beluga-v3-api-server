import { Options } from "./string"
import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/is_string"
import { checkMaxLength } from "../validator/string/max_length"
import { checkMinLength } from "../validator/string/min_length"
import { checkRegexPattern } from "../validator/string/regex"
import config from "../../../config/app"

export function password() {
    const options: Options = {
        minLength: config.user_login_credential.password.min_length,
        maxLength: config.user_login_credential.password.max_length,
    }
    return new Validator<string>(options, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
