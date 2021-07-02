import { LoginCredentialEntity } from "../entity/LoginCredential"

export interface ILoginCredentialsRepository {
    add(credential: LoginCredentialEntity): Promise<void>
    delete(userId: UserId): Promise<boolean>
    findByUserId(userId: UserId): Promise<LoginCredentialEntity | null>
    update(credential: LoginCredentialEntity): Promise<void>
}
