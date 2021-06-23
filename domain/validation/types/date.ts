import { Schema } from "../schema"
import { check_min_value } from "../validator/number/min_value"
import { check_max_value } from "../validator/number/max_value"
import { checkIsDate } from "../validator/date/is_date"

export function date() {
    return new Schema<Date>({}, [checkIsDate, check_min_value, check_max_value])
}
