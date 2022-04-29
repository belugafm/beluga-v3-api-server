import { ChannelQueryRepository, UserQueryRepository } from "../../repositories"
import listMessage, { facts } from "../../api/methods/timeline/channel"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const messages = await listMessage(
            {
                channel_id: Math.trunc(req.query.channel_id),
                since_id: Math.trunc(req.query.since_id),
                max_id: Math.trunc(req.query.max_id),
                limit: Math.trunc(req.query.limit),
                sort_order: req.query.sort_order,
            },
            remoteIpAddress,
            params["authUser"]
        )
        const userQueryRepository = new UserQueryRepository()
        const channelQueryRepository = new ChannelQueryRepository()
        const objects: any[] = []
        for (const message of messages) {
            const user = await userQueryRepository.findById(message.userId)
            if (user == null) {
                continue
            }
            const channel = await channelQueryRepository.findById(message.channelId)
            if (channel == null) {
                continue
            }
            const messageObject = message.toJsonObject()
            messageObject.user = user.toJsonObject()
            messageObject.channel = channel.toJsonObject()
            objects.push(messageObject)
        }
        return {
            ok: true,
            messages: objects,
        }
    })
}
