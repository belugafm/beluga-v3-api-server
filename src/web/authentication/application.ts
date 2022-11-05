import { OAuthAuthenticateAppApplication } from "../../application/oauth/AuthenticateApp"
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

export class ApplicationAuthenticator {
    private oAuthAuthentication: OAuthAuthenticateAppApplication
    constructor(oAuthAuthentication: OAuthAuthenticateAppApplication) {
        this.oAuthAuthentication = oAuthAuthentication
    }
    async authenticate(params: {
        requestBaseUrl: string
        headers: { [key: string]: string }
        body: { [key: string]: string | number | Buffer }
    }): Promise<ApplicationEntity | null> {
        const { requestBaseUrl, headers, body } = params
        const authorizationHeader = headers["authorization"]
        if (typeof authorizationHeader == "string" && authorizationHeader.indexOf("OAuth") == 0) {
            // OAuth認証
            const consumerKey = matchPattern(authorizationHeader, /oauth_consumer_key="(.+?)"/)
            const nonce = matchPattern(authorizationHeader, /oauth_nonce="(.+?)"/)
            const signatureMethod = matchPattern(authorizationHeader, /oauth_signature_method="(.+?)"/)
            const timestamp = matchPattern(authorizationHeader, /oauth_timestamp="(.+?)"/)
            const version = matchPattern(authorizationHeader, /oauth_version="(.+?)"/)
            const signature = matchPattern(authorizationHeader, /oauth_signature="(.+?)"/)
            if (all(consumerKey, nonce, signatureMethod, timestamp, version, signature)) {
                return await this.oAuthAuthentication.authenticate({
                    // @ts-ignore
                    consumerKey,
                    // @ts-ignore
                    nonce,
                    // @ts-ignore
                    signatureMethod,
                    // @ts-ignore
                    timestamp: Math.trunc(timestamp),
                    // @ts-ignore
                    version,
                    // @ts-ignore
                    signature,
                    requestBaseUrl,
                    httpMethod: "POST",
                    requestParams: body,
                })
            }
        }
        return null
    }
}
