import { CookieAuthenticationApplication } from "../../application/authentication/Cookie"
import { MethodFacts } from "../api/define"
import { UserEntity } from "../../domain/entity/User"
import { AuthenticateUserByAccessTokenApplication } from "../../application/oauth/AuthenticateUserByAccessToken"
import { AuthenticateUserByRequestTokenApplication } from "../../application/oauth/AuthenticateUserByRequestToken"
import { ApplicationEntity } from "../../domain/entity/Application"

function matchPattern(str: string, pattern: RegExp) {
    const result = str.match(pattern)
    if (result) {
        return decodeURIComponent(result[1])
    }
    return null
}

function all(...values: any[]) {
    for (const value of values) {
        if (typeof value !== "string") {
            return false
        }
    }
    return true
}

export class UserAuthenticator {
    private cookieAuthentication: CookieAuthenticationApplication
    private accessTokenAuthentication: AuthenticateUserByAccessTokenApplication
    private requestTokenAuthentication: AuthenticateUserByRequestTokenApplication
    constructor(
        cookieAuthentication: CookieAuthenticationApplication,
        accessTokenAuthentication: AuthenticateUserByAccessTokenApplication,
        requestTokenAuthentication: AuthenticateUserByRequestTokenApplication
    ) {
        this.cookieAuthentication = cookieAuthentication
        this.accessTokenAuthentication = accessTokenAuthentication
        this.requestTokenAuthentication = requestTokenAuthentication
    }
    async authenticateByRequestToken(params: {
        facts: MethodFacts
        requestUrl: string
        headers: { [key: string]: string }
        cookies: { [key: string]: string }
        body: { [key: string]: string | number | Buffer }
    }): Promise<[ApplicationEntity | null, UserEntity | null]> {
        const { requestUrl, headers, body } = params
        const authorizationHeader = headers["authorization"]
        if (typeof authorizationHeader == "string" && authorizationHeader.indexOf("OAuth") == 0) {
            // OAuth認証
            const consumerKey = matchPattern(authorizationHeader, /oauth_consumer_key="(.+?)"/)
            const nonce = matchPattern(authorizationHeader, /oauth_nonce="(.+?)"/)
            const signatureMethod = matchPattern(authorizationHeader, /oauth_signature_method="(.+?)"/)
            const timestamp = matchPattern(authorizationHeader, /oauth_timestamp="(.+?)"/)
            const requestToken = matchPattern(authorizationHeader, /oauth_token="(.+?)"/)
            const version = matchPattern(authorizationHeader, /oauth_version="(.+?)"/)
            const signature = matchPattern(authorizationHeader, /oauth_signature="(.+?)"/)
            if (all(consumerKey, nonce, signatureMethod, timestamp, requestToken, version, signature)) {
                return await this.requestTokenAuthentication.authenticate({
                    // @ts-ignore
                    consumerKey,
                    // @ts-ignore
                    nonce,
                    // @ts-ignore
                    signatureMethod,
                    // @ts-ignore
                    timestamp: Math.trunc(timestamp),
                    // @ts-ignore
                    requestToken,
                    // @ts-ignore
                    version,
                    // @ts-ignore
                    signature,
                    requestUrl,
                    requestParams: body,
                })
            }
        }
        return [null, null]
    }
    async authenticate(params: {
        facts: MethodFacts
        requestUrl: string
        headers: { [key: string]: string }
        cookies: { [key: string]: string }
        body: { [key: string]: string | number | Buffer }
    }): Promise<UserEntity | null> {
        const { facts, requestUrl, headers, cookies, body } = params
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
                    return await this.accessTokenAuthentication.authenticate({
                        // @ts-ignore
                        consumerKey,
                        // @ts-ignore
                        nonce,
                        // @ts-ignore
                        signatureMethod,
                        // @ts-ignore
                        timestamp: Math.trunc(timestamp),
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
