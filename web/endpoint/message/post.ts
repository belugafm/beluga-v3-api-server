import postMessage, { facts } from "../../api/methods/message/post"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const channel = await postMessage(
            {
                text: req.body.text,
                channel_id: req.body.channel_id,
                thread_id: req.body.thread_id,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            channel_group: channel.toResponseObject(),
        }
    })
}
