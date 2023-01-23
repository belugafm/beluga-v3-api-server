import listMessage, { facts } from "../../api/methods/timeline/thread"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const messages = await listMessage(
            {
                message_id: Number(req.query.message_id),
                since_id: Number(req.query.since_id),
                max_id: Number(req.query.max_id),
                limit: Number(req.query.limit),
                sort_order: req.query.sort_order,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            messages,
        }
    })
}
