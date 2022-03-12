import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { AuthenticityTokenEntity } from "../../../../domain/entity/AuthenticityToken"
import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { IAuthenticityTokenCommandRepository } from "../../../../domain/repository/command/AuthenticityToken"
import { prisma } from "../client"

export class AuthenticityTokenCommandRepository
    extends ChangeEventHandler
    implements IAuthenticityTokenCommandRepository
{
    constructor(transaction?: any) {
        super(AuthenticityTokenCommandRepository)
    }
    async add(auth: AuthenticityTokenEntity): Promise<boolean> {
        if (auth instanceof AuthenticityTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of AuthenticityTokenEntity")
        }
        try {
            await prisma.authenticityToken.create({
                data: {
                    sessionId: auth.sessionId,
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
    async delete(auth: AuthenticityTokenEntity): Promise<boolean> {
        if (auth instanceof AuthenticityTokenEntity !== true) {
            throw new RepositoryError("`auth` must be an instance of AuthenticityTokenEntity")
        }
        try {
            await prisma.authenticityToken.delete({
                where: {
                    sessionId: auth.sessionId,
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
}
