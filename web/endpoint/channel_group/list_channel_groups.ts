import listChannelGroups, { facts } from "../../api/methods/channel_group/list_channel_groups"

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
        const channelGroups = await listChannelGroups(
            {
                id: Math.trunc(req.query.id),
            },
            remoteIpAddress,
            null
        )
        const channelGroupObjects: any[] = []
        channelGroups.forEach((channelGroup) => {
            channelGroupObjects.push(channelGroup.toResponseObject())
        })
        return {
            ok: true,
            channel_groups: channelGroupObjects,
        }
    })
}
