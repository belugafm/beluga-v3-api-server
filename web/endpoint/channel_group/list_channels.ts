import listChannels, { facts } from "../../api/methods/channel_group/list_channels"

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
        const channels = await listChannels(
            {
                id: Math.trunc(req.query.id),
            },
            remoteIpAddress,
            null
        )
        const channelObjects: any[] = []
        channels.forEach((channel) => {
            channelObjects.push(channel.toResponseObject())
        })
        return {
            ok: true,
            channels: channelObjects,
        }
    })
}
