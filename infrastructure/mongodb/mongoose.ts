import mongoose from "mongoose"
import { ObjectID } from "mongodb"

export function toObjectId(value?: string): ObjectID | undefined {
    if (value == null) {
        return undefined
    }
    return mongoose.Types.ObjectId(value)
}
