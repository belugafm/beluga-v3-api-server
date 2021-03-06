export type EntityId = number
export type UserId = EntityId
export type MessageId = EntityId
export type ChannelId = EntityId
export type ChannelGroupdId = EntityId
export type ChannelReadStateId = EntityId
export type FileId = EntityId

export type UserJsonObjectT = {
    id: UserId
    name: string
    display_name: string | null
    profile_image_url: string | null
    location: string | null
    url: string | null
    description: string | null
    created_at: Date
    message_count: number
    favorites_count: number
    favorited_count: number
    bot: boolean
    active: boolean
    dormant: boolean
    suspended: boolean
    muted: boolean
    blocked: boolean
    trust_level: number
    last_activity_date: Date | null
}

export type MessageEntityStyleNode = {
    children: MessageEntityStyleNode[]
    type: string
    style: {
        format: number
        color: string | null
    } | null
    text: string | null
    indices: number[]
}

export type MessageJsonObjectT = {
    id: MessageId
    channel_id: ChannelId
    channel: ChannelJsonObjectT | null
    user_id: UserId
    user: UserJsonObjectT | null
    text: string | null
    created_at: Date
    favorite_count: number
    like_count: number
    reply_count: number
    thread_id: MessageId | null
    deleted: boolean
    entities: {
        channel_groups: {
            channel_group_id: number
            channel_group: ChannelGroupJsonObjectT | null
            indices: [number, number]
        }[]
        channels: {
            channel_id: number
            channel: ChannelJsonObjectT | null
            indices: [number, number]
        }[]
        messages: {
            message_id: number
            message: MessageJsonObjectT | null
            indices: [number, number]
        }[]
        files: {
            file_id: number
            file: FileJsonObjectT | null
            indices: [number, number]
        }[]
        urls: {
            title: string
            description: string | null
            image_url: string | null
            indices: [number, number]
        }[]
        style: MessageEntityStyleNode[]
    }
}

export type ChannelReadStateJsonObjectT = {
    id: ChannelReadStateId
    channel_id: ChannelId
    user_id: UserId
    last_message_id: MessageId | null
    last_message_created_at: Date | null
    last_message: MessageJsonObjectT | null
}

export type ChannelJsonObjectT = {
    id: ChannelId
    name: string
    unique_name: string
    parent_channel_group_id: ChannelGroupdId
    parent_channel_group: ChannelGroupJsonObjectT | null
    created_by: UserId
    created_at: Date
    message_count: number
    description: string | null
    status_string: string
    last_message_id: MessageId | null
    last_message_created_at: Date | null
    last_message: MessageJsonObjectT | null
    read_state: ChannelReadStateJsonObjectT | null
}

export type ChannelGroupJsonObjectT = {
    id: ChannelGroupdId
    name: string
    unique_name: string
    parent_id: ChannelGroupdId
    parent: ChannelGroupJsonObjectT | null
    level: number
    created_by: UserId
    created_at: Date
    message_count: number
    description: string | null
    image_url: string | null
}

export type FileJsonObjectT = {
    id: FileId
    user_id: UserId
    group: string
    path: string
    type: string
    bytes: number
    original: boolean
    ref_count: number
    created_at: Date
    width: number | null
    height: number | null
    tag: string | null
}
