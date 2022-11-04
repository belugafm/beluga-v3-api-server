import { PrismaClient, Application } from "@prisma/client"
import { ApplicationId, UserId } from "../../../../domain/types"
import { IApplicationQueryRepository } from "../../../../domain/repository/query/Application"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"
import { isInteger, isString } from "../../../../domain/validation"

import { ApplicationEntity } from "../../../../domain/entity/Application"
import { prisma } from "../client"

export function toEntity(app: Application) {
    return new ApplicationEntity({
        id: app.id,
        name: app.name,
        description: app.description,
        userId: app.userId,
        createdAt: app.createdAt,
        callbackUrl: app.callbackUrl,
        token: app.token,
        secret: app.secret,
        read: app.read,
        write: app.write,
    })
}

export class ApplicationQueryRepository implements IApplicationQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(appId: ApplicationId): Promise<ApplicationEntity | null> {
        try {
            if (isInteger(appId) !== true) {
                throw new RepositoryError("`appId` must be a number")
            }
            const app = await this._prisma.application.findUnique({
                where: {
                    id: appId,
                },
            })
            if (app == null) {
                return null
            }
            return toEntity(app)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByTokenAndSecret(token: string, secret: string): Promise<ApplicationEntity | null> {
        try {
            if (isString(token) !== true) {
                throw new RepositoryError("`token` must be a string")
            }
            if (isString(secret) !== true) {
                throw new RepositoryError("`secret` must be a string")
            }
            const app = await this._prisma.application.findUnique({
                where: {
                    token_secret: {
                        token,
                        secret,
                    },
                },
            })
            if (app == null) {
                return null
            }
            return toEntity(app)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByToken(token: string): Promise<ApplicationEntity | null> {
        try {
            if (isString(token) !== true) {
                throw new RepositoryError("`token` must be a string")
            }
            const app = await this._prisma.application.findUnique({
                where: {
                    token,
                },
            })
            if (app == null) {
                return null
            }
            return toEntity(app)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async list(userId: UserId): Promise<ApplicationEntity[]> {
        try {
            const apps = await this._prisma.application.findMany({
                where: {
                    userId,
                },
            })
            return apps.map((app) => toEntity(app))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
