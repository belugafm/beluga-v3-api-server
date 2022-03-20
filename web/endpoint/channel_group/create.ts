import create_channel_group, { facts } from "../../api/methods/channel_group/create"

import { TurboServer } from "../../turbo"
import authenticate from "../../api/methods/auth/cookie/authenticate"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const sessionId = req.cookies["session_id"]
        const [user, _] = await authenticate({ session_id: sessionId }, remoteIpAddress, null)
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
            user: channel.toResponseObject(),
        }
    })
}
