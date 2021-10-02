import { LoginSessionEntity } from "../../domain/entity/LoginSession"

export interface ILoginSessionsQueryRepository {
    findBySessionId(sessionId: string): Promise<LoginSessionEntity>
}
