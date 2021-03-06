import { LoginSession, PrismaClient } from "@prisma/client"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"
import { SortBy, SortOrder } from "../../../../domain/repository/query/LoginSession"

import { ILoginSessionQueryRepository } from "../../../../domain/repository/query/LoginSession"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { UserId } from "../../../../domain/types"
import { prisma } from "../client"

function toEntity(session: LoginSession) {
    return new LoginSessionEntity({
        userId: session.userId,
        sessionId: session.sessionId,
        ipAddress: session.ipAddress,
        expireDate: session.expireDate,
        createdAt: session.createdAt,
        expired: session.expired,
        lastLocation: session.lastLocation,
        device: session.device,
    })
}
export class LoginSessionQueryRepository implements ILoginSessionQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findBySessionId(sessionId: string): Promise<LoginSessionEntity | null> {
        try {
            const session = await this._prisma.loginSession.findUnique({
                where: {
                    sessionId: sessionId,
                },
            })
            if (session == null) {
                return null
            }
            return toEntity(session)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByUserId(
        userId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<LoginSessionEntity[]> {
        try {
            const sessions = await this._prisma.loginSession.findMany({
                where: {
                    userId: userId,
                },
            })
            return sessions.map((session) => toEntity(session))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
