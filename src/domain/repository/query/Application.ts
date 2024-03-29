import { ApplicationId, UserId } from "../../types"

import { ApplicationEntity } from "../../entity/Application"

export interface IApplicationQueryRepository {
    findById(appId: ApplicationId): Promise<ApplicationEntity | null>
    findByTokenAndSecret(token: string, secret: string): Promise<ApplicationEntity | null>
    findByToken(token: string): Promise<ApplicationEntity | null>
    list(userId: UserId): Promise<ApplicationEntity[]>
}
