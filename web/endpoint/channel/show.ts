import show, { facts } from "../../api/methods/channel/show"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const channel = await show(
            {
                unique_name: req.query.unique_name ? req.query.unique_name : null,
                id: req.query.id ? Math.trunc(req.query.id) : undefined,
            },
            remoteIpAddress,
            params["authUser"]
        )
        if (channel) {
            return {
                ok: true,
                channel: channel.toResponseObject(),
            }
        }
        return {
            ok: true,
            channel: null,
        }
    })
}
