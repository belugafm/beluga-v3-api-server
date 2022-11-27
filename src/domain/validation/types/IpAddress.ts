import { Options } from "./String"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { checkRegexPattern } from "../validator/string/regex"

export function IpAddressValidator() {
    const options: Options = {
        regexp: new RegExp(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
    }
    return new PropertyValidator<string>(options, [checkIsString, checkRegexPattern])
}
