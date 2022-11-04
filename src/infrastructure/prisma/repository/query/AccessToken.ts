import { AccessToken, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { AccessTokenEntity } from "../../../../domain/entity/AccessToken"
import { IAccessTokenQueryRepository } from "../../../../domain/repository/query/AccessToken"
import { prisma } from "../client"

function toEntity(auth: AccessToken) {
    return new AccessTokenEntity({
        token: auth.token,
        secret: auth.secret,
        userId: auth.userId,
        applicationId: auth.applicationId,
    })
}
export class AccessTokenQueryRepository implements IAccessTokenQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findByUserIdAndApplicationId(userId: number, applicationId: number): Promise<AccessTokenEntity | null> {
        try {
            const auth = await this._prisma.accessToken.findUnique({
                where: {
                    applicationId_userId: {
                        userId,
                        applicationId,
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
    async findByToken(token: string): Promise<AccessTokenEntity | null> {
        try {
            const auth = await this._prisma.accessToken.findUnique({
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
    async findByTokenAndSecret(token: string, secret: string): Promise<AccessTokenEntity | null> {
        try {
            const auth = await this._prisma.accessToken.findUnique({
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
