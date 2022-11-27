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
                minimum_trust_rank: req.body.minimum_trust_rank,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            channel_group: channelGroup.toJsonObject(),
        }
    })
}
