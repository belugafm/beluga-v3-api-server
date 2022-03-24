import mongoose, { Document, Schema, SchemaDefinition } from "mongoose"

import { AuthenticityTokenEntity } from "../../../domain/entity/AuthenticityToken"

export const schemaVersion = 1

export interface AuthenticityTokenSchema extends Document {
    _id: mongoose.Types.ObjectId
    session_id: string
    token: string
    schema_version: number
    toEntity: () => AuthenticityTokenEntity
}

function defineSchema(): SchemaDefinition {
    return {
        session_id: {
            type: String,
            unique: true,
        },
        token: {
            type: String,
            unique: true,
        },
        schema_version: {
            type: Number,
            default: schemaVersion,
        },
    }
}

const schema: Schema<AuthenticityTokenSchema> = new Schema(defineSchema(), {
    collection: "authenticity_token",
})

schema.index({ user_id: -1 })

schema.methods.toEntity = function () {
    return new AuthenticityTokenEntity({
        sessionId: this.session_id,
        token: this.token,
    })
}

export const AuthenticityTokenModel = mongoose.model<AuthenticityTokenSchema>(
    "AuthenticityToken",
    schema
)
