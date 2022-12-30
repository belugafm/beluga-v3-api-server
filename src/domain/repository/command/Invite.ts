import { InviteEntity } from "../../entity/Invite"
import { InviteId } from "../../types"

export interface IInviteCommandRepository {
    add(invite: InviteEntity): Promise<InviteId>
    delete(invite: InviteEntity): Promise<boolean>
    update(invite: InviteEntity): Promise<boolean>
}
