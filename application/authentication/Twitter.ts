import { UserEntity, generateRandomName } from "../../domain/entity/User"

import { ApplicationError } from "../ApplicationError"
import { CheckUserNameAvailabilityService } from "../../domain/service/CheckUserNameAvailability"
import { IUsersCommandRepository } from "../../domain/repository/command/Users"
import { IUsersQueryRepository } from "../../domain/repository/query/Users"
import OAuth from "oauth-1.0a"
import { URLSearchParams } from "url"
import axios from "axios"
import config from "../../config/app"
import crypto from "crypto"
import { isString } from "../../domain/validation"

export const ErrorCodes = {
    InternalError: "internal_error",
    ApiResponseError: "api_response_error",
    ApiAuthError: "api_auth_error",
} as const

export class ResponseError extends Error {
    paramName: string
    constructor(paramName: string) {
        super()
        this.paramName = paramName
        Object.setPrototypeOf(this, ApplicationError.prototype)
    }
}

function getParam(params: URLSearchParams, key: string): string | null {
    const value = params.get(key)
    if (value) {
        return value
    }
    return null
}

type NullableStringParams<T> = {
    [K in keyof T]: string | null
}

export class RequestTokenResponse {
    oauthToken: string
    oauthTokenSecret: string
    constructor(params: NullableStringParams<RequestTokenResponse>) {
        if (isString(params.oauthToken)) {
            this.oauthToken = params.oauthToken
        } else {
            throw new ResponseError("oauthToken")
        }
        if (isString(params.oauthTokenSecret)) {
            this.oauthTokenSecret = params.oauthTokenSecret
        } else {
            throw new ResponseError("oauthTokenSecret")
        }
    }
}

export class AccessTokenResponse {
    oauthToken: string
    oauthTokenSecret: string
    userId: string
    constructor(params: NullableStringParams<AccessTokenResponse>) {
        if (isString(params.oauthToken)) {
            this.oauthToken = params.oauthToken
        } else {
            throw new ResponseError("oauthToken")
        }
        if (isString(params.oauthTokenSecret)) {
            this.oauthTokenSecret = params.oauthTokenSecret
        } else {
            throw new ResponseError("oauthTokenSecret")
        }
        if (isString(params.userId)) {
            this.userId = params.userId
        } else {
            throw new ResponseError("userId")
        }
    }
}

export class UserResponse {
    id: string
    name: string
    screenName: string
    createdAt: Date
    verified: boolean
    suspended: boolean

    constructor(params: NullableStringParams<UserResponse>) {
        if (isString(params.id)) {
            this.id = params.id
        } else {
            throw new ResponseError("id")
        }
        if (isString(params.name)) {
            this.name = params.name
        } else {
            throw new ResponseError("name")
        }
        if (isString(params.screenName)) {
            this.screenName = params.screenName
        } else {
            throw new ResponseError("screenName")
        }
        if (isString(params.createdAt)) {
            this.createdAt = new Date(params.createdAt)
        } else {
            throw new ResponseError("createdAt")
        }
        if (isString(params.verified)) {
            this.verified = params.verified === "true"
        } else {
            throw new ResponseError("verified")
        }
        if (isString(params.suspended)) {
            this.suspended = params.suspended === "true"
        } else {
            throw new ResponseError("suspended")
        }
    }
}

export class TwitterAuthenticationApplication {
    private usersQueryRepository: IUsersQueryRepository
    private usersCommandRepository: IUsersCommandRepository
    private userNameAvailabilityService: CheckUserNameAvailabilityService
    constructor(
        usersQueryRepository: IUsersQueryRepository,
        usersCommandRepository: IUsersCommandRepository
    ) {
        this.usersQueryRepository = usersQueryRepository
        this.usersCommandRepository = usersCommandRepository
        this.userNameAvailabilityService = new CheckUserNameAvailabilityService(
            usersQueryRepository
        )
    }
    async getRequestToken(): Promise<RequestTokenResponse | null> {
        const url = "https://api.twitter.com/oauth/request_token"
        const oauth = new OAuth({
            consumer: {
                key: config.twitter.api_key,
                secret: config.twitter.api_key_secret,
            },
            signature_method: "HMAC-SHA1",
            hash_function: (baseString, key) =>
                crypto.createHmac("sha1", key).update(baseString).digest("base64"),
        })
        const authHeader = oauth.toHeader(
            oauth.authorize({
                url: url,
                method: "POST",
                data: {
                    oauth_callback: config.twitter.callback_url,
                },
            })
        )
        try {
            const res = await axios.post(url, null, {
                headers: {
                    Authorization: authHeader["Authorization"],
                },
            })
            const params = new URLSearchParams(res.data)
            return new RequestTokenResponse({
                oauthToken: getParam(params, "oauth_token"),
                oauthTokenSecret: getParam(params, "oauth_token_secret"),
            })
        } catch (error) {
            if (error instanceof Error) {
                if (error instanceof ResponseError) {
                    throw new ApplicationError(
                        ErrorCodes.ApiAuthError,
                        `Parameter '${error.paramName}' is invalid.`
                    )
                } else {
                    throw new ApplicationError(ErrorCodes.ApiAuthError, error.message)
                }
            } else {
                throw new ApplicationError(ErrorCodes.ApiAuthError)
            }
        }
    }
    async getAccessToken(
        oauthToken: string,
        oauthVerifier: string
    ): Promise<AccessTokenResponse | null> {
        const url = "https://api.twitter.com/oauth/access_token"
        const oauth = new OAuth({
            consumer: {
                key: config.twitter.api_key,
                secret: config.twitter.api_key_secret,
            },
            signature_method: "HMAC-SHA1",
            hash_function: (baseString, key) =>
                crypto.createHmac("sha1", key).update(baseString).digest("base64"),
        })
        const authHeader = oauth.toHeader(
            oauth.authorize({
                url: url,
                method: "POST",
                data: {
                    oauth_token: oauthToken,
                },
            })
        )

        try {
            const query = new URLSearchParams({
                oauth_verifier: oauthVerifier,
            })
            const res = await axios.post(url, query.toString(), {
                headers: {
                    Authorization: authHeader["Authorization"],
                },
            })
            const params = new URLSearchParams(res.data)
            return new AccessTokenResponse({
                oauthToken: getParam(params, "oauth_token"),
                oauthTokenSecret: getParam(params, "oauth_token_secret"),
                userId: getParam(params, "user_id"),
            })
        } catch (error) {
            if (error instanceof Error) {
                if (error instanceof ResponseError) {
                    throw new ApplicationError(
                        ErrorCodes.ApiAuthError,
                        `Parameter '${error.paramName}' is invalid.`
                    )
                } else {
                    throw new ApplicationError(ErrorCodes.ApiAuthError, error.message)
                }
            } else {
                throw new ApplicationError(ErrorCodes.ApiAuthError)
            }
        }
    }
    async verifyCredentials(
        oauthToken: string,
        oauthTokenSecret: string,
        userId: string
    ): Promise<UserResponse | null> {
        const baseUrl = "https://api.twitter.com/1.1/users/show.json"
        const url =
            baseUrl +
            "?" +
            new URLSearchParams({
                user_id: userId,
            }).toString()
        const oauth = new OAuth({
            consumer: {
                key: config.twitter.api_key,
                secret: config.twitter.api_key_secret,
            },
            signature_method: "HMAC-SHA1",
            hash_function: (baseString, key) =>
                crypto.createHmac("sha1", key).update(baseString).digest("base64"),
        })
        const authHeader = oauth.toHeader(
            oauth.authorize(
                {
                    url: url,
                    method: "GET",
                },
                {
                    key: oauthToken,
                    secret: oauthTokenSecret,
                }
            )
        )

        try {
            const res = await axios.get(url, {
                headers: {
                    Authorization: authHeader["Authorization"],
                },
            })
            const params = new URLSearchParams(res.data)
            return new UserResponse({
                id: getParam(params, "id"),
                name: getParam(params, "name"),
                screenName: getParam(params, "screen_name"),
                createdAt: getParam(params, "created_at"),
                verified: getParam(params, "verified"),
                suspended: getParam(params, "suspended"),
            })
        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                if (error instanceof ResponseError) {
                    throw new ApplicationError(
                        ErrorCodes.ApiAuthError,
                        `Parameter '${error.paramName}' is invalid.`
                    )
                } else {
                    throw new ApplicationError(ErrorCodes.ApiAuthError, error.message)
                }
            } else {
                throw new ApplicationError(ErrorCodes.ApiAuthError)
            }
        }
    }
    async generateUserName(screenName: string) {
        const existingUser = await this.usersQueryRepository.findByName(screenName)
        if (existingUser) {
            const name = generateRandomName(
                (config.user.name.max_length - config.user.name.min_length) / 2
            )
            try {
                await this.userNameAvailabilityService.tryCheckIfNameIsTaken(name)
                return name
            } catch (error) {
                // 2回やれば被ることはたぶんないはず
                return generateRandomName(
                    (config.user.name.max_length - config.user.name.min_length) / 2
                )
            }
        }
        return screenName
    }
    async authenticate(
        oauthToken: string,
        oauthVerifier: string,
        ipAddress: string
    ): Promise<UserEntity | null> {
        const accessTokenResponse = await this.getAccessToken(oauthToken, oauthVerifier)
        console.log(accessTokenResponse)
        if (accessTokenResponse == null) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
        const userResponse = await this.verifyCredentials(
            accessTokenResponse.oauthToken,
            accessTokenResponse.oauthTokenSecret,
            accessTokenResponse.userId
        )
        console.log(userResponse)
        if (userResponse == null) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
        const existingUser = await this.usersQueryRepository.findByTwitterUserId(userResponse.id)
        if (existingUser) {
            console.log("user existing")
            return existingUser
        }
        console.log("creating new user")
        const name = await this.generateUserName(userResponse.screenName)
        const user = new UserEntity({
            id: -1,
            name: name,
            displayName: userResponse.name,
            registrationIpAddress: ipAddress,
            twitterUserId: userResponse.id,
        })
        user.id = await this.usersCommandRepository.add(user)
        console.log(name)
        return user
    }
}
