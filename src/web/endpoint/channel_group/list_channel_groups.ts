import listChannelGroups, { facts } from "../../api/methods/channel_group/list_channel_groups"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
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
