import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { RequestTokenEntity } from "../../../../domain/entity/RequestToken"
import { IRequestTokenCommandRepository } from "../../../../domain/repository/command/RequestToken"
import { PrismaClient } from "@prisma/client"
import { prisma } from "../client"

export class RequestTokenCommandRepository implements IRequestTokenCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(auth: RequestTokenEntity): Promise<boolean> {
        if (auth instanceof RequestTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of RequestTokenEntity")
        }
        try {
            await this._prisma.requestToken.create({
                data: {
                    secret: auth.secret,
                    token: auth.token,
                    applicationId: auth.applicationId,
                    verifier: auth.verifier,
                    expireDate: auth.expireDate,
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
    async update(auth: RequestTokenEntity): Promise<boolean> {
        if (auth instanceof RequestTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of RequestTokenEntity")
        }
        try {
            await this._prisma.requestToken.update({
                where: {
                    token_secret: {
                        token: auth.token,
                        secret: auth.secret,
                    },
                },
                data: {
                    verifier: auth.verifier,
                    verifiedUserId: auth.verifiedUserId,
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
    async delete(auth: RequestTokenEntity): Promise<boolean> {
        if (auth instanceof RequestTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of RequestTokenEntity")
        }
        try {
            await this._prisma.requestToken.delete({
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
