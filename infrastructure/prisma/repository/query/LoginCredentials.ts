import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ILoginCredentialsQueryRepository } from "../../../../domain/repository/query/LoginCredentials"
import { LoginCredential } from "@prisma/client"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { UserId } from "../../../../domain/types"
import { prisma } from "../client"

function toEntity(loginCredential: LoginCredential) {
    return new LoginCredentialEntity({
        userId: loginCredential.userId,
        passwordHash: loginCredential.passwordHash,
    })
}
export class LoginCredentialsQueryRepository implements ILoginCredentialsQueryRepository {
    constructor(transaction?: any) {}
    async findByUserId(userId: UserId): Promise<LoginCredentialEntity | null> {
        try {
            const loginCredential = await prisma.loginCredential.findUnique({
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
