import { PropertyValidator } from "../../PropertyValidator"
import { ValidationError } from "../../error"
import { checkIsString } from "../../validator/string/isString"
import config from "../../../../config/app"

export type Options = {
    allowedTypes: string[]
}

export function checkType(value: string, options: Options): void {
    if (options.allowedTypes.includes(value) == false) {
        throw new ValidationError("サポートされていないファイル形式です")
    }
}

export function TypeValidator() {
    const options: Options = {
        allowedTypes: config.file.allowed_file_types.image.concat(config.file.allowed_file_types.video),
    }
    return new PropertyValidator<string>(options, [checkIsString, checkType])
}
