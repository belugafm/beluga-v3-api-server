import mongoose, { Document, Schema } from "mongoose"

import { LoginCredentialEntity } from "../../../domain/entity/LoginCredential"
import { ObjectId } from "mongodb"

export const schemaVersion = 1

export interface LoginCredentialSchema extends Document {
    _id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    password_hash: string
    schema_version: number
    toModel: () => LoginCredentialEntity
}

function defineSchema(): any {
    return {
        user_id: {
            type: ObjectId,
            unique: true,
        },
        password_hash: {
            type: String,
        },
        schema_version: {
            type: Number,
            default: schemaVersion,
        },
    }
}

const loginCredentialSchema: Schema<LoginCredentialSchema> = new Schema(defineSchema(), {
    collection: "login_credentials",
})

loginCredentialSchema.methods.toModel = function () {
    return new LoginCredentialEntity({
        userId: this.user_id.toHexString(),
        passwordHash: this.password_hash,
    })
}

export const LoginCredentialModel = mongoose.model<LoginCredentialSchema>(
    "LoginCredential",
    loginCredentialSchema
)
