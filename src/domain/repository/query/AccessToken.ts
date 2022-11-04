import { AccessTokenEntity } from "../../entity/AccessToken"
import { ApplicationId, UserId } from "../../types"

export interface IAccessTokenQueryRepository {
    findByTokenAndSecret(token: string, secret: string): Promise<AccessTokenEntity | null>
    findByToken(token: string): Promise<AccessTokenEntity | null>
    findByUserIdAndApplicationId(userId: UserId, applicationId: ApplicationId): Promise<AccessTokenEntity | null>
}
