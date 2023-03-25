import listChannelGroups, { facts } from "../../api/methods/channel_group/list_channel_groups"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const channelGroups = await listChannelGroups(
            {
                id: Number(req.query.id),
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            channel_groups: channelGroups,
        }
    })
}
