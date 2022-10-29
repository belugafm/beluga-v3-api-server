import { AccessTokenEntity } from "../../entity/AccessToken"

export interface IAccessTokenQueryRepository {
    find(token: string, secret: string): Promise<AccessTokenEntity | null>
}
