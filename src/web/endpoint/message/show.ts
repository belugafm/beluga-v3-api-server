import showMessage, { facts } from "../../api/methods/message/show"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const message = await showMessage(
            {
                id: Math.trunc(req.query.id),
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        if (message) {
            return {
                ok: true,
                message,
            }
        }
        return {
            ok: true,
            message: null,
        }
    })
}
