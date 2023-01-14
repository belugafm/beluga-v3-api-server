import show, { facts } from "../../api/methods/channel/show"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const channel = await show(
            {
                unique_name: req.query.unique_name ? req.query.unique_name : null,
                id: req.query.id ? Number(req.query.id) : undefined,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        if (channel) {
            return {
                ok: true,
                channel,
            }
        }
        return {
            ok: true,
            channel: null,
        }
    })
}
