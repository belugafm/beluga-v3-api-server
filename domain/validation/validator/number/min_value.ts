import { is_number } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    min_value?: number
}
export function check_min_value(value: string, options: Options): void {
    if (options.min_value == null) {
        return
    }
    if (is_number(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value.length < options.min_value) {
        throw new ValidationError(
            `${options.min_value}以上の値に設定してください`
        )
    }
}
