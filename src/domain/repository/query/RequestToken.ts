import { RequestTokenEntity } from "../../entity/RequestToken"

export interface IRequestTokenQueryRepository {
    find(token: string, secret: string): Promise<RequestTokenEntity | null>
}
