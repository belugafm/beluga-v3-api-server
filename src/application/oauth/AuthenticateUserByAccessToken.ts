import { ApplicationError } from "../ApplicationError"
import { IAccessTokenQueryRepository } from "../../domain/repository/query/AccessToken"
import { IApplicationQueryRepository } from "../../domain/repository/query/Application"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { ValidateOAuthHeader } from "../../domain/service/ValidateOAuthHeader"
import { UserEntity } from "../../domain/entity/User"

export const ErrorCodes = {
    InvalidAccessToken: "invalid_access_token",
    InvalidConsumerKey: "invalid_consumer_key",
    InvalidAuth: "invalid_auth",
} as const

export class AuthenticateUserByAccessTokenApplication {
    private accessTokenRepository: IAccessTokenQueryRepository
    private applicationRepository: IApplicationQueryRepository
    private userRepository: IUserQueryRepository
    private validator: ValidateOAuthHeader
    constructor(
        accessTokenRepository: IAccessTokenQueryRepository,
        applicationRepository: IApplicationQueryRepository,
        userRepository: IUserQueryRepository
    ) {
        this.accessTokenRepository = accessTokenRepository
        this.applicationRepository = applicationRepository
        this.userRepository = userRepository
        this.validator = new ValidateOAuthHeader()
    }
    async authenticate({
        consumerKey,
        accessToken,
        requestParams,
        requestUrl,
        nonce,
        signatureMethod,
        timestamp,
        version,
        httpMethod,
        signature,
    }: {
        consumerKey: string
        accessToken: string
        requestTokenSecret: string
        requestParams: { [key: string]: string | number | Buffer }
        requestUrl: string
        nonce: string
        signatureMethod: string
        timestamp: number
        version: string
        httpMethod: string
        signature: string
    }): Promise<UserEntity | null> {
        const auth = await this.accessTokenRepository.findByToken(accessToken)
        if (auth == null) {
            throw new ApplicationError(ErrorCodes.InvalidAccessToken)
        }
        const app = await this.applicationRepository.findByToken(consumerKey)
        if (app == null) {
            throw new ApplicationError(ErrorCodes.InvalidConsumerKey)
        }
        if (
            this.validator.validateSignature(signature, {
                consumerKey,
                accessToken,
                requestParams,
                requestUrl,
                nonce,
                signatureMethod,
                timestamp,
                version,
                httpMethod,
                consumerSecret: app.secret,
                accessTokenSecret: auth.secret,
            })
        ) {
            const user = await this.userRepository.findById(auth.userId)
            if (user) {
                return user
            }
        }
        throw new ApplicationError(ErrorCodes.InvalidAuth)
    }
}
