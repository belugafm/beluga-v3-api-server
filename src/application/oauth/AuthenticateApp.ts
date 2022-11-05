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
        requestBaseUrl,
        nonce,
        signatureMethod,
        timestamp,
        version,
        httpMethod,
        signature,
    }: {
        consumerKey: string
        accessToken: string
        requestParams: { [key: string]: string | number | Buffer }
        requestBaseUrl: string
        nonce: string
        signatureMethod: string
        timestamp: number
        version: string
        httpMethod: string
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
                requestBaseUrl,
                nonce,
                signatureMethod,
                timestamp,
                version,
                httpMethod,
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
