import { Validator } from "../Validator"
import { CommonErrorMessages, ValidationError } from "../ValidationError"

export function boolean() {
    return new Validator<boolean>({}, [
        (value: any) => {
            if (typeof value !== "boolean") {
                throw new ValidationError(CommonErrorMessages.InvalidType)
            }
        },
    ])
}
