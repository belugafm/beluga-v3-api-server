import { ApplicationError } from "../ApplicationError"
import { IRequestTokenQueryRepository } from "../../domain/repository/query/RequestToken"
import { IApplicationQueryRepository } from "../../domain/repository/query/Application"
import { IUserQueryRepository } from "../../domain/repository/query/User"
import { ValidateOAuthHeader } from "../../domain/service/ValidateOAuthHeader"
import { UserEntity } from "../../domain/entity/User"
import { ApplicationEntity } from "../../domain/entity/Application"

export const ErrorCodes = {
    InvalidRequestToken: "invalid_request_token",
    InvalidConsumerKey: "invalid_consumer_key",
    InvalidAuth: "invalid_auth",
} as const

export class AuthenticateUserByRequestTokenApplication {
    private requestTokenRepository: IRequestTokenQueryRepository
    private applicationRepository: IApplicationQueryRepository
    private userRepository: IUserQueryRepository
    private validator: ValidateOAuthHeader
    constructor(
        requestTokenRepository: IRequestTokenQueryRepository,
        applicationRepository: IApplicationQueryRepository,
        userRepository: IUserQueryRepository
    ) {
        this.requestTokenRepository = requestTokenRepository
        this.applicationRepository = applicationRepository
        this.userRepository = userRepository
        this.validator = new ValidateOAuthHeader()
    }
    async authenticate({
        consumerKey,
        requestToken,
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
        requestToken: string
        requestParams: { [key: string]: string | number | Buffer }
        requestUrl: string
        nonce: string
        signatureMethod: string
        timestamp: number
        version: string
        httpMethod: string
        signature: string
    }): Promise<[ApplicationEntity | null, UserEntity | null]> {
        const auth = await this.requestTokenRepository.findByToken(requestToken)
        if (auth == null) {
            throw new ApplicationError(ErrorCodes.InvalidRequestToken)
        }
        if (auth.verifiedUserId == null) {
            throw new ApplicationError(ErrorCodes.InvalidRequestToken)
        }
        const app = await this.applicationRepository.findByToken(consumerKey)
        if (app == null) {
            throw new ApplicationError(ErrorCodes.InvalidConsumerKey)
        }
        if (
            this.validator.validateSignature(signature, {
                consumerKey,
                requestParams,
                requestUrl,
                nonce,
                signatureMethod,
                timestamp,
                version,
                httpMethod,
                accessToken: requestToken,
                consumerSecret: app.secret,
                accessTokenSecret: auth.secret,
            })
        ) {
            const user = await this.userRepository.findById(auth.verifiedUserId)
            if (user) {
                return [app, user]
            }
        }
        throw new ApplicationError(ErrorCodes.InvalidAuth)
    }
}
