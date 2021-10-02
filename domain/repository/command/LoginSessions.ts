import { LoginSessionEntity } from "../../entity/LoginSession"

export interface ILoginSessionsCommandRepository {
    add(session: LoginSessionEntity): Promise<boolean>
    update(session: LoginSessionEntity): Promise<boolean>
    delete(session: LoginSessionEntity): Promise<boolean>
}
