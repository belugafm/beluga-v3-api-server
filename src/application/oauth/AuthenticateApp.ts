import { ApplicationError } from "../ApplicationError"
import { IApplicationQueryRepository } from "../../domain/repository/query/Application"
import { ValidateOAuthHeader } from "../../domain/service/ValidateOAuthHeader"
import { ApplicationEntity } from "../../domain/entity/Application"

export const ErrorCodes = {
    InvalidAccessToken: "invalid_access_token",
    InvalidConsumerKey: "invalid_consumer_key",
    InvalidAuth: "invalid_auth",
} as const

export class OAuthAuthenticateAppApplication {
    private applicationRepository: IApplicationQueryRepository
    private validator: ValidateOAuthHeader
    constructor(applicationRepository: IApplicationQueryRepository) {
        this.applicationRepository = applicationRepository
        this.validator = new ValidateOAuthHeader()
    }
    async authenticate({
        consumerKey,
        requestParams,
        requestUrl,
        nonce,
        signatureMethod,
        timestamp,
        version,
        signature,
    }: {
        consumerKey: string
        accessToken: string
        requestParams: { [key: string]: string | number | Buffer }
        requestUrl: string
        nonce: string
        signatureMethod: string
        timestamp: number
        version: string
        signature: string
    }): Promise<ApplicationEntity | null> {
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
                consumerSecret: app.secret,
                accessToken: null,
                accessTokenSecret: null,
            })
        ) {
            return app
        }
        throw new ApplicationError(ErrorCodes.InvalidAuth)
    }
}
