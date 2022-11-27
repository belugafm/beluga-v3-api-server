export const TrustRank = {
    RiskyUser: "RiskyUser",
    Visitor: "Visitor",
    AuthorizedUser: "AuthorizedUser",
    Moderator: "Moderator",
} as const

export const TrustLevel = {
    [TrustRank.RiskyUser]: 0,
    [TrustRank.Visitor]: 10,
    [TrustRank.AuthorizedUser]: 20,
    [TrustRank.Moderator]: 30,
} as const

export const TrustRankDescription = {
    [TrustRank.RiskyUser]: "不審ユーザー",
    [TrustRank.Visitor]: "ビジター",
    [TrustRank.AuthorizedUser]: "認証ユーザー",
    [TrustRank.Moderator]: "モデレーター",
} as const
