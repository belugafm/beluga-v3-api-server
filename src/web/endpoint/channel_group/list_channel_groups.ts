import listChannelGroups, { facts } from "../../api/methods/channel_group/list_channel_groups"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const channelGroups = await listChannelGroups(
            {
                id: Math.trunc(req.query.id),
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            channel_groups: channelGroups.map((channelGroup) => channelGroup.toResponseObject()),
        }
    })
}
