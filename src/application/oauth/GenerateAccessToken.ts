import { ApplicationError } from "../ApplicationError"
import { IRequestTokenCommandRepository } from "../../domain/repository/command/RequestToken"
import { IRequestTokenQueryRepository } from "../../domain/repository/query/RequestToken"
import { AccessTokenEntity } from "../../domain/entity/AccessToken"
import { IAccessTokenCommandRepository } from "../../domain/repository/command/AccessToken"
import { ApplicationEntity } from "../../domain/entity/Application"
import { IAccessTokenQueryRepository } from "../../domain/repository/query/AccessToken"

export const ErrorCodes = {
    InvalidConsumerKey: "invalid_consumer_key",
    InvalidRequestToken: "invalid_request_token",
    InvalidVerifier: "invalid_verifier",
    NotVerified: "not_verified",
    Expired: "expired",
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
} as const

export class GenerateAccessTokenApplication {
    private accessTokenQueryRepository: IAccessTokenQueryRepository
    private accessTokenCommandRepository: IAccessTokenCommandRepository
    private requestTokenQueryRepository: IRequestTokenQueryRepository
    private requestTokenCommandRepository: IRequestTokenCommandRepository
    constructor(
        accessTokenQueryRepository: IAccessTokenQueryRepository,
        accessTokenCommandRepository: IAccessTokenCommandRepository,
        requestTokenQueryRepository: IRequestTokenQueryRepository,
        requestTokenCommandRepository: IRequestTokenCommandRepository
    ) {
        this.accessTokenQueryRepository = accessTokenQueryRepository
        this.accessTokenCommandRepository = accessTokenCommandRepository
        this.requestTokenQueryRepository = requestTokenQueryRepository
        this.requestTokenCommandRepository = requestTokenCommandRepository
    }
    async generate({
        app,
        requestToken,
        verifier,
    }: {
        app: ApplicationEntity
        requestToken: string
        verifier: string
    }): Promise<AccessTokenEntity> {
        const req = await this.requestTokenQueryRepository.findByToken(requestToken)
        if (req == null) {
            throw new ApplicationError(ErrorCodes.InvalidRequestToken)
        }
        if (req.expireDate.getTime() < Date.now()) {
            throw new ApplicationError(ErrorCodes.Expired)
        }
        if (req.verifier !== verifier) {
            throw new ApplicationError(ErrorCodes.InvalidVerifier)
        }
        if (req.verifiedUserId == null) {
            throw new ApplicationError(ErrorCodes.NotVerified)
        }
        try {
            await this.requestTokenCommandRepository.delete(req)
            const auth = new AccessTokenEntity({
                userId: req.verifiedUserId,
                applicationId: app.id,
            })
            const existingAuth = await this.accessTokenQueryRepository.findByUserIdAndApplicationId(
                req.verifiedUserId,
                app.id
            )
            if (existingAuth) {
                await this.accessTokenCommandRepository.update(auth)
            } else {
                await this.accessTokenCommandRepository.add(auth)
            }
            return auth
        } catch (error) {
            console.error(error)
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
