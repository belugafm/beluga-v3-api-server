import * as mongo from "../mongoose"

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
    async delete(userId: UserId) {
        try {
            const user_id = mongo.toObjectId(userId as string)
            const result = await LoginCredentialModel.deleteOne({ user_id }).exec()
            if (result.deletedCount === 1) {
                return true
            }
            return false
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async findByUserId(userId: UserId) {
        try {
            const user_id = mongo.toObjectId(userId as string)
            const result = await LoginCredentialModel.findOne({ user_id }).exec()
            if (result == null) {
                return null
            }
            return result.toModel()
        } catch (error) {
            if (error instanceof MongoError) {
                throw new RepositoryError(error.message, error.stack, error.code)
            }
            throw new RepositoryError(error.message, error.stack)
        }
    }
    async update(credential: LoginCredentialEntity) {
        return true
    }
}
