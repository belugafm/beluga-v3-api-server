import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"
import { SortBy, SortOrder } from "../../../../domain/repository/query/LoginSessions"

import { ILoginSessionsQueryRepository } from "../../../../domain/repository/query/LoginSessions"
import { LoginSession } from "@prisma/client"
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
export class LoginSessionsQueryRepository implements ILoginSessionsQueryRepository {
    constructor(transaction?: any) {}
    async findBySessionId(sessionId: string): Promise<LoginSessionEntity | null> {
        try {
            const session = await prisma.loginSession.findUnique({
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
            const sessions = await prisma.loginSession.findMany({
                where: {
                    userId: userId,
                },
            })
            const ret: LoginSessionEntity[] = []
            sessions.forEach((session) => {
                ret.push(toEntity(session))
            })
            return ret
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
