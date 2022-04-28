import { Validator } from "../Validator"
import { checkIsInteger } from "../validator/number/isNumber"
import { checkMaxValue } from "../validator/number/maxValue"
import { checkMinValue } from "../validator/number/minValue"

export type Options = {
    minValue?: number
    maxValue?: number
    regexp?: object
}
export function integer(options?: Options) {
    return new Validator<number>(options || {}, [checkIsInteger, checkMinValue, checkMaxValue])
}
