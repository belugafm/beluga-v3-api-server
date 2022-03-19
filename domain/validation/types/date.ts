import { Validator } from "../Validator"
import { checkIsDate } from "../validator/date/isDate"
import { checkMaxValue } from "../validator/number/maxValue"
import { checkMinValue } from "../validator/number/minValue"

export function date() {
    return new Validator<Date>({}, [checkIsDate, checkMinValue, checkMaxValue])
}
