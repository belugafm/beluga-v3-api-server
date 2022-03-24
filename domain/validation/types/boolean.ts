import { CommonErrorMessages, ValidationError } from "../error"

import { Validator } from "../Validator"

export function boolean() {
    return new Validator<boolean>({}, [
        (value: any) => {
            if (typeof value !== "boolean") {
                throw new ValidationError(CommonErrorMessages.InvalidType)
            }
        },
    ])
}
