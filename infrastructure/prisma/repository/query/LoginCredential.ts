import { LoginCredential, PrismaClient } from "@prisma/client"
import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ILoginCredentialQueryRepository } from "../../../../domain/repository/query/LoginCredential"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { UserId } from "../../../../domain/types"
import { prisma } from "../client"

function toEntity(loginCredential: LoginCredential) {
    return new LoginCredentialEntity({
        userId: loginCredential.userId,
        passwordHash: loginCredential.passwordHash,
    })
}
export class LoginCredentialQueryRepository implements ILoginCredentialQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findByUserId(userId: UserId): Promise<LoginCredentialEntity | null> {
        try {
            const loginCredential = await this._prisma.loginCredential.findUnique({
                where: {
                    userId: userId,
                },
            })
            if (loginCredential == null) {
                return null
            }
            return toEntity(loginCredential)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
