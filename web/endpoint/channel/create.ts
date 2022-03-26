import create_channel, { facts } from "../../api/methods/channel/create"

import { TurboServer } from "../../turbo"
import authenticate from "../../api/methods/auth/cookie/authenticate"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const sessionId = req.cookies["session_id"]
        const [user] = await authenticate({ session_id: sessionId }, remoteIpAddress, null)
        if (user == null) {
            return {
                ok: false,
            }
        }
        const channel = await create_channel(
            {
                name: req.body.name,
                parent_channel_group_id: req.body.parent_channel_group_id,
                created_by: user.id,
            },
            remoteIpAddress,
            null
        )
        return {
            ok: true,
            channel: channel.toResponseObject(),
        }
    })
}
