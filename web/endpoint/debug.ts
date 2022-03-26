import debug, { facts } from "../api/methods/debug"

import { TurboServer } from "../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        await debug({}, remoteIpAddress, null)
        return {
            ok: true,
        }
    })
}
