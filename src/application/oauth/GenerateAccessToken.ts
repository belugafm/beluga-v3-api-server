import { ApplicationError } from "../ApplicationError"
import { IApplicationQueryRepository } from "../../domain/repository/query/Application"
import { IRequestTokenCommandRepository } from "../../domain/repository/command/RequestToken"
import { IRequestTokenQueryRepository } from "../../domain/repository/query/RequestToken"
import { AccessTokenEntity } from "../../domain/entity/AccessToken"
import { IAccessTokenCommandRepository } from "../../domain/repository/command/AccessToken"
import { UserId } from "../../domain/types"

export const ErrorCodes = {
    InvalidConsumerKey: "invalid_consumer_key",
    InvalidRequestToken: "invalid_request_token",
    InvalidVerifier: "invalid_verifier",
    InvalidAuthentication: "invalid_auth",
    Expired: "expired",
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
} as const

export class GenerateAccessTokenApplication {
    private accessTokenCommandRepository: IAccessTokenCommandRepository
    private requestTokenQueryRepository: IRequestTokenQueryRepository
    private requestTokenCommandRepository: IRequestTokenCommandRepository
    private appQueryRepository: IApplicationQueryRepository
    constructor(
        accessTokenCommandRepository: IAccessTokenCommandRepository,
        requestTokenQueryRepository: IRequestTokenQueryRepository,
        requestTokenCommandRepository: IRequestTokenCommandRepository,
        appQueryRepository: IApplicationQueryRepository
    ) {
        this.accessTokenCommandRepository = accessTokenCommandRepository
        this.requestTokenQueryRepository = requestTokenQueryRepository
        this.requestTokenCommandRepository = requestTokenCommandRepository
        this.appQueryRepository = appQueryRepository
    }
    async generate({
        userId,
        consumerKey,
        consumerSecret,
        requestToken,
        requestTokenSecret,
        verifier,
    }: {
        userId: UserId
        consumerKey: string
        consumerSecret: string
        requestToken: string
        requestTokenSecret: string
        verifier: string
    }): Promise<AccessTokenEntity> {
        const app = await this.appQueryRepository.findByTokenAndSecret(consumerKey, consumerSecret)
        if (app == null) {
            throw new ApplicationError(ErrorCodes.InvalidConsumerKey)
        }
        const req = await this.requestTokenQueryRepository.find(requestToken, requestTokenSecret)
        if (req == null) {
            throw new ApplicationError(ErrorCodes.InvalidRequestToken)
        }
        if (req.expireDate.getTime() < Date.now()) {
            throw new ApplicationError(ErrorCodes.Expired)
        }
        if (req.verifier !== verifier) {
            throw new ApplicationError(ErrorCodes.InvalidVerifier)
        }
        if (req.verifiedUserId !== userId) {
            throw new ApplicationError(ErrorCodes.InvalidAuthentication)
        }
        try {
            await this.requestTokenCommandRepository.delete(req)
            const auth = new AccessTokenEntity({
                userId: userId,
                applicationId: app.id,
            })
            await this.accessTokenCommandRepository.add(auth)
            return auth
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
