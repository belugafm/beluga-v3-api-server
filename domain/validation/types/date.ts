import { Validator } from "../Validator"
import { checkMinValue } from "../validator/number/min_value"
import { checkMaxValue } from "../validator/number/max_value"
import { checkIsDate } from "../validator/date/is_date"

export function date() {
    return new Validator<Date>({}, [checkIsDate, checkMinValue, checkMaxValue])
}
