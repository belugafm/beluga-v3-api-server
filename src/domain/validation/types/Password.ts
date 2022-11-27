import { Options } from "./String"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkMaxLength } from "../validator/string/maxLength"
import { checkMinLength } from "../validator/string/minLength"
import { checkRegexPattern } from "../validator/string/regex"
import config from "../../../config/app"

export function PasswordValidator() {
    const options: Options = {
        minLength: config.user_login_credential.password.min_length,
        maxLength: config.user_login_credential.password.max_length,
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMinLength, checkMaxLength, checkRegexPattern])
}
