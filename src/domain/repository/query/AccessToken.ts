import { AccessTokenEntity } from "../../entity/AccessToken"

export interface IAccessTokenQueryRepository {
    findByTokenAndSecret(token: string, secret: string): Promise<AccessTokenEntity | null>
    findByToken(token: string): Promise<AccessTokenEntity | null>
}
