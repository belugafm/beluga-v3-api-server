import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { AccessTokenEntity } from "../../../../domain/entity/AccessToken"
import { IAccessTokenCommandRepository } from "../../../../domain/repository/command/AccessToken"
import { PrismaClient } from "@prisma/client"
import { prisma } from "../client"

export class AccessTokenCommandRepository implements IAccessTokenCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async update(auth: AccessTokenEntity): Promise<boolean> {
        if (auth instanceof AccessTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of AccessTokenEntity")
        }
        try {
            await this._prisma.accessToken.update({
                where: {
                    applicationId_userId: {
                        applicationId: auth.applicationId,
                        userId: auth.userId,
                    },
                },
                data: {
                    secret: auth.secret,
                    token: auth.token,
                },
            })
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async add(auth: AccessTokenEntity): Promise<boolean> {
        if (auth instanceof AccessTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of AccessTokenEntity")
        }
        try {
            await this._prisma.accessToken.create({
                data: {
                    secret: auth.secret,
                    token: auth.token,
                    userId: auth.userId,
                    applicationId: auth.applicationId,
                },
            })
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(auth: AccessTokenEntity): Promise<boolean> {
        if (auth instanceof AccessTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of AccessTokenEntity")
        }
        try {
            await this._prisma.accessToken.delete({
                where: {
                    token_secret: {
                        token: auth.token,
                        secret: auth.secret,
                    },
                },
            })
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
