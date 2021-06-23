import { is_number } from "../../functions"
import { ValidationError, CommonErrorMessages } from "../../error"

export type Options = {}
export function check_is_number(value: number, options: Options): void {
    if (is_number(value) !== true) {
        throw new ValidationError(CommonErrorMessages.InvalidType)
    }
}
