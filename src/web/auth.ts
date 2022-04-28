import { CookieAuthenticationApplication } from "../application/authentication/Cookie"
import { MethodFacts } from "./api/define"
import { UserEntity } from "../domain/entity/User"

export class Authenticator {
    private cookieAuthentication: CookieAuthenticationApplication
    constructor(cookieAuthentication: CookieAuthenticationApplication) {
        this.cookieAuthentication = cookieAuthentication
    }
    async authenticateUser(facts: MethodFacts, query: any, cookies: any): Promise<UserEntity | null> {
        query = query || {}
        cookies = cookies || {}
        const { access_token, access_token_scret, oauth_consumer_key, oauth_consumer_secret, oauth_bearer_token } =
            query
        if (facts.acceptedAuthenticationMethods.includes("OAuth")) {
            if (oauth_bearer_token && oauth_consumer_key && oauth_consumer_secret) {
                // OAuth認証
            }
        }
        if (facts.acceptedAuthenticationMethods.includes("AccessToken")) {
            if (access_token && access_token_scret) {
                // アクセストークンによる認証
            }
        }
        if (facts.acceptedAuthenticationMethods.includes("Cookie")) {
            // Cookieを使ったログインセッション
            const sessionId = cookies["session_id"]
            const [user] = await this.cookieAuthentication.authenticate({ sessionId })
            return user
        }
        return null
    }
}
