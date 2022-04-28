import show, { facts } from "../../api/methods/channel_group/show"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const channelGroup = await show(
            {
                unique_name: req.query.unique_name ? req.query.unique_name : null,
                id: req.query.id ? Math.trunc(req.query.id) : undefined,
            },
            remoteIpAddress,
            params["authUser"]
        )
        if (channelGroup) {
            return {
                ok: true,
                channel_group: channelGroup.toResponseObject(),
            }
        }
        return {
            ok: true,
            channel_group: null,
        }
    })
}
