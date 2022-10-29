import { RequestTokenEntity } from "../../entity/RequestToken"

export interface IRequestTokenCommandRepository {
    add(token: RequestTokenEntity): Promise<boolean>
    update(token: RequestTokenEntity): Promise<boolean>
    delete(token: RequestTokenEntity): Promise<boolean>
}
