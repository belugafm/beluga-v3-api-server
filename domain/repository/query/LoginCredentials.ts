import { LoginCredentialEntity } from "../../entity/LoginCredential"
import { UserId } from "../../types"

export interface ILoginCredentialsQueryRepository {
    findByUserId(userId: UserId): Promise<LoginCredentialEntity | null>
}
