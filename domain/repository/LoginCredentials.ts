import { LoginCredentialEntity } from "../entity/LoginCredential"

export interface ILoginCredentialsRepository {
    add(credential: LoginCredentialEntity): Promise<boolean>
}
