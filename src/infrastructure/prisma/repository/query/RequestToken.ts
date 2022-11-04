import { RequestToken, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { RequestTokenEntity } from "../../../../domain/entity/RequestToken"
import { IRequestTokenQueryRepository } from "../../../../domain/repository/query/RequestToken"
import { prisma } from "../client"

function toEntity(auth: RequestToken) {
    return new RequestTokenEntity({
        applicationId: auth.applicationId,
        token: auth.token,
        secret: auth.secret,
        expireDate: auth.expireDate,
        verifier: auth.verifier,
        verifiedUserId: auth.verifiedUserId,
    })
}
export class RequestTokenQueryRepository implements IRequestTokenQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findByToken(token: string): Promise<RequestTokenEntity | null> {
        try {
            const auth = await this._prisma.requestToken.findUnique({
                where: {
                    token,
                },
            })
            if (auth == null) {
                return null
            }
            return toEntity(auth)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByTokenAndSecret(token: string, secret: string): Promise<RequestTokenEntity | null> {
        try {
            const auth = await this._prisma.requestToken.findUnique({
                where: {
                    token_secret: {
                        token,
                        secret,
                    },
                },
            })
            if (auth == null) {
                return null
            }
            return toEntity(auth)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
