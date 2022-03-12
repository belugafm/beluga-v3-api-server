import {
    RepositoryError,
    UnknownRepositoryError,
} from "../../../../domain/repository/RepositoryError"

import { ChangeEventHandler } from "../../../ChangeEventHandler"
import { ILoginCredentialsCommandRepository } from "../../../../domain/repository/command/LoginCredentials"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { PrismaClient } from "@prisma/client"
import { prisma } from "../client"

export class LoginCredentialsCommandRepository
    extends ChangeEventHandler
    implements ILoginCredentialsCommandRepository
{
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        super(LoginCredentialsCommandRepository)
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(credential: LoginCredentialEntity): Promise<boolean> {
        if (credential instanceof LoginCredentialEntity !== true) {
            throw new RepositoryError("`credential` must be an instance of LoginCredentialEntity")
        }
        try {
            await this._prisma.loginCredential.create({
                data: {
                    userId: credential.userId,
                    passwordHash: credential.passwordHash,
                },
            })
            return true
        } catch (error) {
            console.log(typeof credential.userId)
            console.log(typeof credential.passwordHash)
            console.log(error)
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(credential: LoginCredentialEntity): Promise<boolean> {
        if (credential instanceof LoginCredentialEntity !== true) {
            throw new RepositoryError("`credential` must be an instance of LoginCredentialEntity")
        }
        try {
            await this._prisma.loginCredential.delete({
                where: {
                    userId: credential.userId,
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
    async update(credential: LoginCredentialEntity): Promise<boolean> {
        if (credential instanceof LoginCredentialEntity !== true) {
            throw new RepositoryError("`credential` must be an instance of LoginCredentialEntity")
        }
        try {
            await this._prisma.loginCredential.update({
                where: {
                    userId: credential.userId,
                },
                data: {
                    passwordHash: credential.passwordHash,
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
