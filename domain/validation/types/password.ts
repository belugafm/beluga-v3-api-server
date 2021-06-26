import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/is_string"
import { checkMinLength } from "../validator/string/min_length"
import { checkMaxLength } from "../validator/string/max_length"
import { checkRegexPattern } from "../validator/string/regex"
import { Options } from "./string"
import config from "../../../config/app"

export function password() {
    const options: Options = {
        minLength: config.user_login_credential.password.min_length,
        maxLength: 72, // bcryptは72文字までが有効らしい
    }
    return new Validator<string>(options, [
        checkIsString,
        checkMinLength,
        checkMaxLength,
        checkRegexPattern,
    ])
}
