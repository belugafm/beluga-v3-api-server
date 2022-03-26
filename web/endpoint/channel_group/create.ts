import create_channel_group, { facts } from "../../api/methods/channel_group/create"

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
        const channel = await create_channel_group(
            {
                name: req.body.name,
                parent_id: req.body.parent_id,
                created_by: user.id,
            },
            remoteIpAddress,
            null
        )
        return {
            ok: true,
            channel_group: channel.toResponseObject(),
        }
    })
}
