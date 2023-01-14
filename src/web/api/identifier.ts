export const MethodIdentifiers = {
    Login: "account/signin",
    AuthenticateUserWithCookie: "auth/cookie/authenticate",
    GetTwitterRequestToken: "auth/twitter/request_token",
    AuthenticateUserWithTwitter: "auth/twitter/authenticate",
    GenerateRequestToken: "oauth/request_token",
    GenerateAccessToken: "oauth/access_token",
    Authorize: "oauth/authorize",
    CreateAccount: "account/signup",
    SignInToAccount: "account/signin",
    UpdateProfileImage: "account/update_profile_image",
    CreateChannelGroup: "channel_group/create",
    ShowChannelGroup: "channel_group/show",
    ListChannelsInChannelGroup: "channel_group/list_channels",
    ListChannelGroupsInChannelGroup: "channel_group/list_channel_groups",
    UploadFile: "upload/media",
    CreateApp: "app/create",
    ListApps: "app/list_apps",
    CreateChannel: "channel/create",
    DeleteChannel: "channel/delete",
    FollowChannel: "channel/follow/create",
    UnfollowChannel: "channel/follow/delete",
    ShowChannel: "channel/show",
    ListAllChannels: "channel/list_channels",
    PostMessage: "message/post",
    DeleteMessage: "message/delete",
    ShowMessage: "message/show",
    SearchMessage: "message/search",
    ShowInvite: "invites/show",
    CreateLike: "likes/create",
    CreateFavorite: "favorites/create",
    DestroyFavorite: "favorites/destroy",
    MuteUser: "mutes/create",
    UnmuteUser: "mutes/delete",
    BlockUser: "blocks/create",
    UnblockUser: "blocks/delete",
    ShowUser: "user/show",
    ChannelTimeline: "timeline/channel",
    ChannelGroupTimeline: "timeline/channel_group",
    ThreadTimeline: "timeline/thread",
    Debug: "debug",
}
