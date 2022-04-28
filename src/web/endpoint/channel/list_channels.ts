import listChannels, { facts } from "../../api/methods/channel/list_channels"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const channels = await listChannels(
            {
                sort_by: req.query.sort_by,
                sort_order: req.query.sort_order,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            channels: channels.map((channel) => channel.toResponseObject()),
        }
    })
}
