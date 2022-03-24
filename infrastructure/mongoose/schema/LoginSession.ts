import mongoose, { Document, Schema, SchemaDefinition } from "mongoose"

import { LoginSessionEntity } from "../../../domain/entity/LoginSession"
import { ObjectId } from "mongodb"

export const schemaVersion = 1

export interface LoginSessionSchema extends Document {
    _id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    session_id: string
    ip_address: string
    expire_date: Date
    created_at: Date
    expired: boolean
    last_location: string | null
    device: string | null
    schema_version: number
    toEntity: () => LoginSessionEntity
}

function defineSchema(): SchemaDefinition {
    return {
        user_id: {
            type: ObjectId,
        },
        session_id: {
            type: String,
            unique: true,
        },
        ip_address: {
            type: String,
        },
        expire_date: {
            type: Date,
        },
        created_at: {
            type: Date,
        },
        expired: {
            type: Boolean,
        },
        last_location: {
            type: String,
            default: null,
        },
        device: {
            type: String,
            default: null,
        },
        schema_version: {
            type: Number,
            default: schemaVersion,
        },
    }
}

const schema: Schema<LoginSessionSchema> = new Schema(defineSchema(), {
    collection: "login_sessions",
})

schema.index({ user_id: -1 })

schema.methods.toEntity = function () {
    return new LoginSessionEntity({
        userId: this.user_id.toHexString(),
        sessionId: this.session_id,
        ipAddress: this.ip_address,
        expireDate: this.expire_date,
        createdAt: this.created_at,
        expired: this.expired,
        lastLocation: this.last_location,
        device: this.device,
    })
}

export const LoginSessionModel = mongoose.model<LoginSessionSchema>("LoginSession", schema)
