import postMessage, { facts } from "../../api/methods/message/post"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const message = await postMessage(
            {
                text: req.body.text,
                text_style: req.body.text_style,
                channel_id: req.body.channel_id ? Number(req.body.channel_id) : undefined,
                thread_id: req.body.thread_id ? Number(req.body.thread_id) : undefined,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            message: message,
        }
    })
}
