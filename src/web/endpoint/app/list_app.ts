import listApps, { facts } from "../../api/methods/app/list_apps"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const apps = await listApps({}, remoteIpAddress, params["authUser"], null)
        return {
            ok: true,
            apps: apps.map((app) => app.toJsonObject()),
        }
    })
}
