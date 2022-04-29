import { PropertyValidator } from "../PropertyValidator"
import { checkIsDate } from "../validator/date/isDate"
import { checkMaxValue } from "../validator/number/maxValue"
import { checkMinValue } from "../validator/number/minValue"

export function date() {
    return new PropertyValidator<Date>({}, [checkIsDate, checkMinValue, checkMaxValue])
}
