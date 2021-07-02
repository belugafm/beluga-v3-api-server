import mongoose, { Document, Schema } from "mongoose"

import { UserEntity } from "../../../domain/entity/User"

export const schemaVersion = 1

export interface UserSchema extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    twitter_user_id: string | null
    display_name: string | null
    profile_image_url: string | null
    location: string | null
    url: string | null
    description: string | null
    theme_color: string | null
    background_image_url: string | null
    default_profile: boolean
    status_count: number
    favorites_count: number
    favorited_count: number
    likes_count: number
    liked_count: number
    channels_count: number
    following_channels_count: number
    created_at: Date
    active: boolean
    dormant: boolean
    suspended: boolean
    trust_level: number
    last_activity_date: Date | null
    terms_of_service_agreement_date: Date | null
    terms_of_service_agreement_version: string | null
    registration_ip_address: string
    schema_version: number
    toEntity: () => UserEntity
}

const NullableString = {
    type: String,
    default: null,
}
const Zero = {
    type: Number,
    default: null,
}
const True = {
    type: Boolean,
    default: true,
}
const False = {
    type: Boolean,
    default: false,
}

function defineSchema(): any {
    return {
        name: {
            type: String,
            unique: true,
        },
        twitter_user_id: NullableString,
        display_name: NullableString,
        profile_image_url: NullableString,
        location: NullableString,
        url: NullableString,
        description: NullableString,
        theme_color: NullableString,
        background_image_url: NullableString,
        default_profile: True,
        status_count: Zero,
        favorites_count: Zero,
        favorited_count: Zero,
        likes_count: Zero,
        liked_count: Zero,
        channels_count: Zero,
        following_channels_count: Zero,
        created_at: Date,
        active: False,
        dormant: False,
        suspended: False,
        trust_level: Zero,
        last_activity_date: {
            type: Date,
            default: null,
        },
        terms_of_service_agreement_date: {
            type: Date,
            default: null,
        },
        terms_of_service_agreement_version: NullableString,
        registration_ip_address: {
            type: String,
        },
        schema_version: {
            type: Number,
            default: schemaVersion,
        },
    }
}

const schema: Schema<UserSchema> = new Schema(defineSchema(), {
    collection: "users",
})
schema.index({ registration_ip_address: -1 })

schema.methods.toEntity = function () {
    return new UserEntity({
        id: this._id.toHexString(),
        name: this.name,
        twitterUserId: this.twitter_user_id,
        displayName: this.display_name,
        profileImageUrl: this.profile_image_url,
        location: this.location,
        url: this.url,
        description: this.description,
        themeColor: this.theme_color,
        backgroundImageUrl: this.background_image_url,
        defaultProfile: this.default_profile,
        statusCount: this.status_count,
        favoritesCount: this.favorites_count,
        favoritedCount: this.favorited_count,
        likesCount: this.likes_count,
        likedCount: this.liked_count,
        channelsCount: this.channels_count,
        followingChannelsCount: this.following_channels_count,
        createdAt: this.created_at,
        active: this.active,
        dormant: this.dormant,
        suspended: this.suspended,
        trustLevel: this.trust_level,
        lastActivityDate: this.last_activity_date,
        termsOfServiceAgreementDate: this.terms_of_service_agreement_date,
        termsOfServiceAgreementVersion: this.terms_of_service_agreement_version,
        registrationIpAddress: this.registration_ip_address,
    })
}

export const UserModel = mongoose.model<UserSchema>("User", schema)
