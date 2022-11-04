import { CookieAuthenticationApplication } from "../application/authentication/Cookie"
import { MethodFacts } from "./api/define"
import { UserEntity } from "../domain/entity/User"
import { OAuthAuthenticateUserApplication } from "../application/oauth/Authenticate"

function matchPattern(str: string, pattern: RegExp) {
    const result = str.match(pattern)
    if (result) {
        return decodeURIComponent(result[1])
    }
    return null
}

function all(...values: any[]) {
    for (const value of values) {
        if (typeof value !== "string" && typeof value !== "number") {
            return false
        }
    }
    return true
}

export class Authenticator {
    private cookieAuthentication: CookieAuthenticationApplication
    private oAuthAuthentication: OAuthAuthenticateUserApplication
    constructor(
        cookieAuthentication: CookieAuthenticationApplication,
        oAuthAuthentication: OAuthAuthenticateUserApplication
    ) {
        this.cookieAuthentication = cookieAuthentication
        this.oAuthAuthentication = oAuthAuthentication
    }
    async authenticateUser(
        facts: MethodFacts,
        requestUrl: string,
        headers: { [key: string]: string },
        cookies: { [key: string]: string },
        body: { [key: string]: string | number | Buffer }
    ): Promise<UserEntity | null> {
        cookies = cookies || {}
        if (facts.acceptedAuthenticationMethods.includes("OAuth")) {
            const authorizationHeader = headers["authorization"]
            if (typeof authorizationHeader == "string" && authorizationHeader.indexOf("OAuth") == 0) {
                // OAuth認証
                const consumerKey = matchPattern(authorizationHeader, /oauth_consumer_key="(.+?)"/)
                const nonce = matchPattern(authorizationHeader, /oauth_nonce="(.+?)"/)
                const signatureMethod = matchPattern(authorizationHeader, /oauth_signature_method="(.+?)"/)
                const timestamp = matchPattern(authorizationHeader, /oauth_timestamp="(.+?)"/)
                const accessToken = matchPattern(authorizationHeader, /oauth_token="(.+?)"/)
                const version = matchPattern(authorizationHeader, /oauth_version="(.+?)"/)
                const signature = matchPattern(authorizationHeader, /oauth_signature="(.+?)"/)
                if (all(consumerKey, nonce, signatureMethod, timestamp, accessToken, version, signature)) {
                    return await this.oAuthAuthentication.authenticate({
                        // @ts-ignore
                        consumerKey,
                        // @ts-ignore
                        nonce,
                        // @ts-ignore
                        signatureMethod,
                        // @ts-ignore
                        timestamp,
                        // @ts-ignore
                        accessToken,
                        // @ts-ignore
                        version,
                        // @ts-ignore
                        signature,
                        requestUrl,
                        requestParams: body,
                    })
                }
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
