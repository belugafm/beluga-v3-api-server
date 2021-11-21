import { TrustLevel } from "../../config/trust_level"

type Condition = {
    signedUpWithTwitter: boolean
    invitedByAuthorizedUser: boolean
    twitterAccountCreatedAt: Date | null
}
export class GetInitialTrustLevelService {
    static getTrustLevel(condition: Condition) {
        if (condition.invitedByAuthorizedUser) {
            // Authorized Userから招待されていたら同じ信頼度にする
            return TrustLevel.AuthorizedUser
        }
        if (condition.signedUpWithTwitter == false) {
            // Twitterログインしていないユーザーは信頼しない
            return TrustLevel.RiskyUser
        }
        if (condition.twitterAccountCreatedAt == null) {
            // ここを通ったらバグっている
            return TrustLevel.RiskyUser
        }
        // とりあえず作成から１年経ってたら信頼する
        const period = 1 * 365 * 24 * 60 * 60 * 1000
        if (condition.twitterAccountCreatedAt.getTime() + period <= new Date().getTime()) {
            return TrustLevel.AuthorizedUser
        }
        // Moderator以上は手動で設定するのでここではしない
        return TrustLevel.Visitor
    }
}
