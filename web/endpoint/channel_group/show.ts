import show, { facts } from "../../api/methods/channel_group/show"

import { TurboServer } from "../../turbo"
import authenticate from "../../api/methods/auth/cookie/authenticate"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const sessionId = req.cookies["session_id"]
        const [user] = await authenticate({ session_id: sessionId }, remoteIpAddress, null)
        if (user == null) {
            return {
                ok: false,
                needs_login: true,
            }
        }
        const channel = await show(
            {
                unique_name: req.query.unique_name ? req.query.unique_name : null,
                id: req.query.id ? Math.trunc(req.query.id) : undefined,
            },
            remoteIpAddress,
            null
        )
        if (channel) {
            return {
                ok: true,
                channel_group: channel.toResponseObject(),
            }
        }
        return {
            ok: true,
            channel_group: null,
        }
    })
}
