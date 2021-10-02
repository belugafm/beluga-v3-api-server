import { LoginCredentialEntity } from "../../entity/LoginCredential"

export interface ILoginCredentialsQueryRepository {
    findByUserId(userId: UserId): Promise<LoginCredentialEntity | null>
}
