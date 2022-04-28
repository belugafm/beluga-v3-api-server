import createChannel, { facts } from "../../api/methods/channel/create"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const channel = await createChannel(
            {
                name: req.body.name,
                parent_channel_group_id: req.body.parent_channel_group_id,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            channel: channel.toResponseObject(),
        }
    })
}
