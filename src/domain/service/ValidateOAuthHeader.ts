import crypto from "crypto"
import OAuth from "oauth-1.0a"

type ValidationInputT = {
    requestParams: { [key: string]: string | number | Buffer }
    requestUrl: string
    consumerKey: string
    consumerSecret: string
    nonce: string
    signatureMethod: string
    timestamp: number // 秒
    accessToken: string | null
    accessTokenSecret: string | null
    version: string
}
export class ValidateOAuthHeader {
    validateSignature(signature: string, params: ValidationInputT): boolean {
        try {
            const true_signature = this.tryCreateSignature(params)
            if (signature === true_signature) {
                return true
            }
            throw new Error()
        } catch (error) {
            return false
        }
    }
    tryCreateSignature(params: ValidationInputT): string {
        const {
            requestParams,
            requestUrl,
            consumerKey,
            consumerSecret,
            nonce,
            signatureMethod,
            timestamp,
            accessToken,
            accessTokenSecret,
            version,
        } = params
        if (signatureMethod !== "HMAC-SHA1") {
            throw new Error()
        }
        if (typeof timestamp != "number") {
            throw new Error()
        }
        if (Date.now() > (timestamp + 300) * 1000) {
            // 5分のマージン
            throw new Error()
        }
        const oauth = new OAuth({
            consumer: { key: consumerKey, secret: consumerSecret },
            signature_method: signatureMethod,
            hash_function(base_string, key) {
                return crypto.createHmac("sha1", key).update(base_string).digest("base64")
            },
        })
        return oauth.getSignature(
            {
                url: requestUrl,
                method: "POST",
                data: requestParams,
            },
            accessTokenSecret ? accessTokenSecret : undefined,
            accessToken
                ? {
                      oauth_consumer_key: consumerKey,
                      oauth_token: accessToken,
                      oauth_nonce: nonce,
                      oauth_signature_method: signatureMethod,
                      oauth_timestamp: timestamp,
                      oauth_version: version,
                  }
                : {
                      oauth_consumer_key: consumerKey,
                      oauth_nonce: nonce,
                      oauth_signature_method: signatureMethod,
                      oauth_timestamp: timestamp,
                      oauth_version: version,
                  }
        )
    }
}
