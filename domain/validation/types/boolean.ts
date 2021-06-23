import { Schema } from "../schema"
import { CommonErrorMessages, ValidationError } from "../error"

export function boolean() {
    return new Schema<boolean>({}, [
        (value: any) => {
            if (typeof value !== "boolean") {
                throw new ValidationError(CommonErrorMessages.InvalidType)
            }
        },
    ])
}
