import createLike, { facts } from "../../api/methods/likes/create"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const message = await createLike(
            {
                message_id: Number(req.body.message_id),
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            message: message,
        }
    })
}
