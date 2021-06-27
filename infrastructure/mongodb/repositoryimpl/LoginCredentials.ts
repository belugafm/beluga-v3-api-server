import { LoginCredentialModel, schemaVersion } from "../schema/LoginCredential"

import { ILoginCredentialsRepository } from "../../../domain/repository/LoginCredentials"
import { LoginCredentialEntity } from "../../../domain/entity/LoginCredential"
import { MongoError } from "mongodb"
import { RepositoryError } from "../../../domain/repository/RepositoryError"

export class LoginCredentialsRepository implements ILoginCredentialsRepository {
    async add(credential: LoginCredentialEntity) {
        if (credential instanceof LoginCredentialEntity !== true) {
            throw new RepositoryError("user.loginCredential not set")
        }
        try {
            await LoginCredentialModel.create({
                user_id: credential.userId,
                password_hash: credential.passwordHash,
                schema_version: schemaVersion,
            })
            return true
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
}
