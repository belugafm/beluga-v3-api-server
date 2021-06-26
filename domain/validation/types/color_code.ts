import { Validator } from "../Validator"
import { checkIsString } from "../validator/string/is_string"
import { checkRegexPattern } from "../validator/string/regex"
import { Options } from "./string"

export function colorCode() {
    const options: Options = {
        regexp: new RegExp(/^#[0-9a-fA-F]{6}$/),
    }
    return new Validator<string>(options, [checkIsString, checkRegexPattern])
}
