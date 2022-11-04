import { ApplicationError } from "../ApplicationError"
import { IApplicationQueryRepository } from "../../domain/repository/query/Application"
import { RequestTokenEntity } from "../../domain/entity/RequestToken"
import { IRequestTokenCommandRepository } from "../../domain/repository/command/RequestToken"

export const ErrorCodes = {
    InvalidConsumerKey: "invalid_consumer_key",
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
} as const

export class GenerateRequestTokenApplication {
    private requestTokenCommandRepository: IRequestTokenCommandRepository
    private appQueryRepository: IApplicationQueryRepository
    constructor(
        requestTokenCommandRepository: IRequestTokenCommandRepository,
        appQueryRepository: IApplicationQueryRepository
    ) {
        this.requestTokenCommandRepository = requestTokenCommandRepository
        this.appQueryRepository = appQueryRepository
    }
    async generate({
        consumerKey,
        consumerSecret,
    }: {
        consumerKey: string
        consumerSecret: string
    }): Promise<RequestTokenEntity> {
        const app = await this.appQueryRepository.findByTokenAndSecret(consumerKey, consumerSecret)
        if (app == null) {
            throw new ApplicationError(ErrorCodes.InvalidConsumerKey)
        }
        try {
            const token = new RequestTokenEntity({
                applicationId: app.id,
            })
            await this.requestTokenCommandRepository.add(token)
            return token
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
