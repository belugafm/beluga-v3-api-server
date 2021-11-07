import { AuthenticityTokenEntity } from "../../entity/AuthenticityToken"

export interface IAuthenticityTokenQueryRepository {
    findBySessionId(sessionId: string): Promise<AuthenticityTokenEntity | null>
}
