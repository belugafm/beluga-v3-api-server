import deleteMessage, { facts } from "../../api/methods/message/delete"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const succeeded = await deleteMessage(
            {
                id: Math.trunc(req.body.id),
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: succeeded,
        }
    })
}
