import listBots, { facts } from "../../api/methods/bot/list_bots"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const bots = await listBots({}, remoteIpAddress, params["authUser"], null)
        return {
            ok: true,
            bots,
        }
    })
}
