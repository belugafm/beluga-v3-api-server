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
    schema_version: number
    toModel: () => UserEntity
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
        schema_version: {
            type: Number,
            default: schemaVersion,
        },
    }
}

const userSchema: Schema<UserSchema> = new Schema(defineSchema(), {
    collection: "users",
})

userSchema.methods.toModel = function () {
    const user = new UserEntity(this._id.toHexString(), this.name)
    user.twitterUserId = this.twitter_user_id
    user.displayName = this.display_name
    user.profileImageUrl = this.profile_image_url
    user.location = this.location
    user.url = this.url
    user.description = this.description
    user.themeColor = this.theme_color
    user.backgroundImageUrl = this.background_image_url
    user.defaultProfile = this.default_profile
    user.statusCount = this.status_count
    user.favoritesCount = this.favorites_count
    user.favoritedCount = this.favorited_count
    user.likesCount = this.likes_count
    user.likedCount = this.liked_count
    user.channelsCount = this.channels_count
    user.followingChannelsCount = this.following_channels_count
    user.createdAt = this.created_at
    user.active = this.active
    user.dormant = this.dormant
    user.suspended = this.suspended
    user.trustLevel = this.trust_level
    user.lastActivityDate = this.last_activity_date
    user.termsOfServiceAgreementDate = this.terms_of_service_agreement_date
    user.termsOfServiceAgreementVersion = this.terms_of_service_agreement_version
    return user
}

export const UserModel = mongoose.model<UserSchema>("user", userSchema)
