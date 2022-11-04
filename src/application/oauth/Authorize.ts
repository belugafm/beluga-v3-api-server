import { ApplicationError } from "../ApplicationError"
import { IRequestTokenCommandRepository } from "../../domain/repository/command/RequestToken"
import { IRequestTokenQueryRepository } from "../../domain/repository/query/RequestToken"
import { v4 } from "uuid"
import { UserId } from "../../domain/types"

export const ErrorCodes = {
    InvalidRequestToken: "invalid_request_token",
    Expired: "expired",
    InternalError: "internal_error",
    UserNotFound: "user_not_found",
} as const

export class AuthorizeUserApplication {
    private requestTokenCommandRepository: IRequestTokenCommandRepository
    private requestTokenQueryRepository: IRequestTokenQueryRepository
    constructor(
        requestTokenCommandRepository: IRequestTokenCommandRepository,
        requestTokenQueryRepository: IRequestTokenQueryRepository
    ) {
        this.requestTokenCommandRepository = requestTokenCommandRepository
        this.requestTokenQueryRepository = requestTokenQueryRepository
    }
    async authorize({
        userId,
        requestToken,
        requestTokenSecret,
    }: {
        userId: UserId
        requestToken: string
        requestTokenSecret: string
    }): Promise<string> {
        const auth = await this.requestTokenQueryRepository.findByTokenAndSecret(requestToken, requestTokenSecret)
        if (auth == null) {
            throw new ApplicationError(ErrorCodes.InvalidRequestToken)
        }
        if (auth.expireDate.getTime() < Date.now()) {
            throw new ApplicationError(ErrorCodes.Expired)
        }
        try {
            const verifier = v4()
            auth.verifier = verifier
            auth.verifiedUserId = userId
            await this.requestTokenCommandRepository.update(auth)
            return verifier
        } catch (error) {
            throw new ApplicationError(ErrorCodes.InternalError)
        }
    }
}
