import createFavorite, { facts } from "../../api/methods/favorites/create"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const succeeded = await createFavorite(
            {
                message_id: Math.trunc(req.body.message_id),
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: succeeded,
        }
    })
}
