import { LoginCredentialEntity } from "../../entity/LoginCredential"
import { UserId } from "../../types"

export interface ILoginCredentialQueryRepository {
    findByUserId(userId: UserId): Promise<LoginCredentialEntity | null>
}
