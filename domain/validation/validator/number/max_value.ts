import { is_number } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../error"

export type Options = {
    max_value?: number
}
export function check_max_value(value: number, options: Options): void {
    if (options.max_value == null) {
        return
    }
    if (is_number(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
    if (value > options.max_value) {
        throw new ValidationError(
            `${options.max_value + 1}以上の値に設定することはできません`
        )
    }
}
