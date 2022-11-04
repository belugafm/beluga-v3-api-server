import { RequestTokenEntity } from "../../entity/RequestToken"

export interface IRequestTokenQueryRepository {
    findByToken(token: string): Promise<RequestTokenEntity | null>
    findByTokenAndSecret(token: string, secret: string): Promise<RequestTokenEntity | null>
}
