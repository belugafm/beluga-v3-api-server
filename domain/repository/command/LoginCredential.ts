import { LoginCredentialEntity } from "../../entity/LoginCredential"

export interface ILoginCredentialCommandRepository {
    add(credential: LoginCredentialEntity): Promise<boolean>
    update(credential: LoginCredentialEntity): Promise<boolean>
    delete(credential: LoginCredentialEntity): Promise<boolean>
}
