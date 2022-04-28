import postMessage, { facts } from "../../api/methods/message/post"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const message = await postMessage(
            {
                text: req.body.text,
                channel_id: req.body.channel_id ? Math.trunc(req.body.channel_id) : undefined,
                thread_id: req.body.thread_id ? Math.trunc(req.body.thread_id) : undefined,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            message: message.toResponseObject(),
        }
    })
}
