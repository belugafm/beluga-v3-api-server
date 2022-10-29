import { AccessTokenEntity } from "../../entity/AccessToken"

export interface IAccessTokenCommandRepository {
    add(token: AccessTokenEntity): Promise<boolean>
    delete(token: AccessTokenEntity): Promise<boolean>
}
