import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { AuthenticityToken } from "@prisma/client"
import { AuthenticityTokenEntity } from "../../../../domain/entity/AuthenticityToken"
import { IAuthenticityTokenQueryRepository } from "../../../../domain/repository/query/AuthenticityToken"
import { prisma } from "../client"

function toEntity(auth: AuthenticityToken) {
    return new AuthenticityTokenEntity({
        sessionId: auth.sessionId,
        token: auth.token,
    })
}
export class AuthenticityTokenQueryRepository implements IAuthenticityTokenQueryRepository {
    constructor(transaction?: any) {}

    async findBySessionId(sessionId: string): Promise<AuthenticityTokenEntity | null> {
        try {
            const auth = await prisma.authenticityToken.findUnique({
                where: {
                    sessionId: sessionId,
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
