import { FavoriteEntity } from "../../entity/Favorite"
import { EntityId } from "../../types"

export interface IFavoriteCommandRepository {
    add(favorite: FavoriteEntity): Promise<EntityId>
    delete(favorite: FavoriteEntity): Promise<boolean>
}
