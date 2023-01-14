import listChannels, { facts } from "../../api/methods/channel_group/list_channels"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const channels = await listChannels(
            {
                id: Number(req.query.id),
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            channels,
        }
    })
}
