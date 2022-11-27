import createChannel, { facts } from "../../api/methods/channel/create"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const channel = await createChannel(
            {
                name: req.body.name,
                parent_channel_group_id: req.body.parent_channel_group_id,
                minimum_trust_rank: req.body.minimum_trust_rank,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            channel: channel.toJsonObject(),
        }
    })
}
