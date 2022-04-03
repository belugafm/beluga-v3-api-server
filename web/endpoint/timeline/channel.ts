import listMessage, { facts } from "../../api/methods/timeline/channel"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const messages = await listMessage(
            {
                channel_id: Math.trunc(req.query.channel_id),
                since_id: Math.trunc(req.query.since_id),
                max_id: Math.trunc(req.query.max_id),
                limit: Math.trunc(req.query.limit),
                sort_order: req.query.sort_order,
            },
            remoteIpAddress,
            params["authUser"]
        )
        const objects: any[] = []
        messages.forEach((message) => {
            objects.push(message.toResponseObject())
        })
        return {
            ok: true,
            messages: objects,
        }
    })
}
