import { PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

import { ApplicationEntity } from "../../../../domain/entity/Application"
import { ApplicationId } from "../../../../domain/types"
import { IApplicationCommandRepository } from "../../../../domain/repository/command/Application"
import { prisma } from "../client"

export class ApplicationCommandRepository implements IApplicationCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(app: ApplicationEntity): Promise<ApplicationId> {
        if (app instanceof ApplicationEntity !== true) {
            throw new RepositoryError("`app` must be an instance of ApplicationEntity")
        }
        try {
            const result = await this._prisma.application.create({
                data: {
                    name: app.name,
                    userId: app.userId,
                    createdAt: app.createdAt,
                    description: app.description,
                    callbackUrl: app.callbackUrl,
                    token: app.token,
                    secret: app.secret,
                    read: app.read,
                    write: app.write,
                },
            })
            return result.id
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async update(app: ApplicationEntity): Promise<boolean> {
        if (app instanceof ApplicationEntity !== true) {
            throw new RepositoryError("`app` must be an instance of ApplicationEntity")
        }
        try {
            await this._prisma.application.update({
                where: {
                    id: app.id,
                },
                data: {
                    name: app.name,
                    description: app.description,
                    callbackUrl: app.callbackUrl,
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
    async delete(app: ApplicationEntity): Promise<boolean> {
        if (app instanceof ApplicationEntity !== true) {
            throw new RepositoryError("`app` must be an instance of ApplicationEntity")
        }
        try {
            await this._prisma.application.delete({
                where: {
                    id: app.id,
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
