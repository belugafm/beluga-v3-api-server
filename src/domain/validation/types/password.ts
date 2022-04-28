import { Options } from "./string"
import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/isString"
import { checkMaxLength } from "../validator/string/maxLength"
import { checkMinLength } from "../validator/string/minLength"
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
