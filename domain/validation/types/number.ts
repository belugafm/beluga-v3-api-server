import { Validator } from "../Validator"
import { checkIsNumber } from "../validator/number/isNumber"
import { checkMaxValue } from "../validator/number/maxValue"
import { checkMinValue } from "../validator/number/minValue"

export type Options = {
    minValue?: number
    maxValue?: number
    regexp?: object
}
export function number(options?: Options) {
    return new Validator<number>(options || {}, [checkIsNumber, checkMinValue, checkMaxValue])
}
