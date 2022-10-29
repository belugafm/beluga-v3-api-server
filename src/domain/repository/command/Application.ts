import { ApplicationEntity } from "../../entity/Application"
import { ChannelId } from "../../types"

export interface IApplicationCommandRepository {
    add(app: ApplicationEntity): Promise<ChannelId>
    delete(app: ApplicationEntity): Promise<boolean>
    update(app: ApplicationEntity): Promise<boolean>
}
