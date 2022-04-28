import { AuthenticityTokenEntity } from "../../entity/AuthenticityToken"

export interface IAuthenticityTokenCommandRepository {
    add(token: AuthenticityTokenEntity): Promise<boolean>
    delete(token: AuthenticityTokenEntity): Promise<boolean>
}
