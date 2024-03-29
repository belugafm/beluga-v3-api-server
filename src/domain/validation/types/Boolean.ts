import { CommonErrorMessages, ValidationError } from "../error"

import { PropertyValidator } from "../PropertyValidator"

export function BooleanValidator() {
    return new PropertyValidator<boolean>({}, [
        (value: any) => {
            if (typeof value !== "boolean") {
                throw new ValidationError(CommonErrorMessages.InvalidType)
            }
        },
    ])
}
