import { LikeEntity } from "../../entity/Like"
import { EntityId } from "../../types"

export interface ILikeCommandRepository {
    add(like: LikeEntity): Promise<EntityId>
    update(like: LikeEntity): Promise<boolean>
    delete(like: LikeEntity): Promise<boolean>
}
