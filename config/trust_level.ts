export const TrustLevel = {
    RiskyUser: 0,
    Visitor: 10,
    AuthorizedUser: 20,
    Moderator: 30,
}
export const TrustLevelDescription = {
    [TrustLevel.RiskyUser]: "不審ユーザー",
    [TrustLevel.Visitor]: "ビジター",
    [TrustLevel.AuthorizedUser]: "認証ユーザー",
    [TrustLevel.Moderator]: "モデレーター",
}
