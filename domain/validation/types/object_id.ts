import { Schema } from "../schema"
import mongoose from "mongoose"
import { CommonErrorMessages, ValidationError } from "../error"

export function object_id() {
    return new Schema<mongoose.Types.ObjectId>({}, [
        (object_id: any) => {
            if (object_id instanceof mongoose.Types.ObjectId !== true) {
                throw new ValidationError(CommonErrorMessages.InvalidType)
            }
        },
    ])
}

export function nullable_object_id() {
    return new Schema<mongoose.Types.ObjectId | null>({}, [
        (object_id: any) => {
            if (object_id === null) {
                return
            }
            if (object_id instanceof mongoose.Types.ObjectId !== true) {
                throw new ValidationError(CommonErrorMessages.InvalidType)
            }
        },
    ])
}
