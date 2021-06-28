import { LoginCredentialEntity } from "../entity/LoginCredential"

export interface ILoginCredentialsRepository {
    add(credential: LoginCredentialEntity): Promise<boolean>
    delete(userId: UserId): Promise<boolean>
    findByUserId(userId: UserId): Promise<LoginCredentialEntity | null>
    update(credential: LoginCredentialEntity): Promise<boolean>
}
