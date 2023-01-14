import searchMessage, { facts } from "../../api/methods/message/search"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const messages = await searchMessage(
            {
                text: req.query.text,
                channel_id: req.query.channel_id ? Number(req.query.channel_id) : undefined,
                user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
                since_id: req.query.since_id ? Number(req.query.since_id) : undefined,
                max_id: req.query.max_id ? Number(req.query.max_id) : undefined,
                since_date: req.query.since_date ? Number(req.query.since_date) : undefined,
                until_date: req.query.until_date ? Number(req.query.until_date) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                sort_by: req.query.sort_by,
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
