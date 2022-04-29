import createChannelGroup, { facts } from "../../api/methods/channel_group/create"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const channelGroup = await createChannelGroup(
            {
                name: req.body.name,
                parent_id: req.body.parent_id,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            channel_group: channelGroup.toJsonObject(),
        }
    })
}
