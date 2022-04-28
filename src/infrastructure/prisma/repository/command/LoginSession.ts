import { LoginSession, PrismaClient } from "@prisma/client"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { ILoginSessionCommandRepository } from "../../../../domain/repository/command/LoginSession"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { prisma } from "../client"

export function has_changed(a: LoginSessionEntity, b: LoginSession) {
    return !(
        a.userId === b.userId &&
        a.sessionId === b.sessionId &&
        a.ipAddress === b.ipAddress &&
        a.expireDate.getTime() === b.expireDate.getTime() &&
        a.createdAt.getTime() === b.createdAt.getTime() &&
        a.expired === b.expired &&
        a.lastLocation === b.lastLocation &&
        a.device === b.device
    )
}

export class LoginSessionCommandRepository
    extends ChangeEventHandler
    implements ILoginSessionCommandRepository
{
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super(LoginSessionCommandRepository)
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(session: LoginSessionEntity): Promise<boolean> {
        if (session instanceof LoginSessionEntity !== true) {
            throw new RepositoryError("`session` must be an instance of LoginSessionEntity")
        }
        try {
            await this._prisma.loginSession.create({
                data: {
                    userId: session.userId,
                    sessionId: session.sessionId,
                    ipAddress: session.ipAddress,
                    expireDate: session.expireDate,
                    createdAt: session.createdAt,
                    expired: session.expired,
                    lastLocation: session.lastLocation,
                    device: session.device,
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
    async update(session: LoginSessionEntity): Promise<boolean> {
        if (session instanceof LoginSessionEntity !== true) {
            throw new RepositoryError("`session` must be an instance of LoginSessionEntity")
        }
        try {
            const updatedSession = await this._prisma.loginSession.update({
                where: { sessionId: session.sessionId },
                data: {
                    userId: session.userId,
                    sessionId: session.sessionId,
                    ipAddress: session.ipAddress,
                    expireDate: session.expireDate,
                    createdAt: session.createdAt,
                    expired: session.expired,
                    lastLocation: session.lastLocation,
                    device: session.device,
                },
            })
            if (has_changed(session, updatedSession)) {
                await this.emitChanges(session.sessionId)
                return true
            }
            return false
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(session: LoginSessionEntity): Promise<boolean> {
        if (session instanceof LoginSessionEntity !== true) {
            throw new RepositoryError("`session` must be an instance of LoginSessionEntity")
        }
        try {
            await this._prisma.loginSession.delete({
                where: {
                    sessionId: session.sessionId,
                },
            })
            await this.emitChanges(session.sessionId)
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
