import { Options } from "../String"
import { PropertyValidator } from "../../PropertyValidator"
import { checkIsString } from "../../validator/string/isString"
import { checkMaxLength } from "../../validator/string/maxLength"
import { checkMinLength } from "../../validator/string/minLength"
import config from "../../../../config/app"

export function DescriptionValidator() {
    const options: Options = {
        minLength: config.user.description.min_length,
        maxLength: config.user.description.max_length,
    }
    return new PropertyValidator<string>(options, [checkIsString, checkMinLength, checkMaxLength])
}
