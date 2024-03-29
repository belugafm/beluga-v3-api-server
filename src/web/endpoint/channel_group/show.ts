import show, { facts } from "../../api/methods/channel_group/show"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const channelGroup = await show(
            {
                unique_name: req.query.unique_name ? req.query.unique_name : null,
                id: req.query.id ? Number(req.query.id) : undefined,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            channel_group: channelGroup,
        }
    })
}
