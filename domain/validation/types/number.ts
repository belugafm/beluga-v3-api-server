import { Validator } from "../Validator"
import { checkMinValue } from "../validator/number/min_value"
import { checkMaxValue } from "../validator/number/max_value"
import { checkIsNumber } from "../validator/number/is_number"

export type Options = {
    minValue?: number
    maxValue?: number
    regexp?: object
}
export function number(options?: Options) {
    return new Validator<number>(options || {}, [checkIsNumber, checkMinValue, checkMaxValue])
}
