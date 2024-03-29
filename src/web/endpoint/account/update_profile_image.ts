import update, { facts } from "../../api/methods/account/update_profile_image"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const file = await update(
            {
                file: req.body.file,
                user_id: req.body.user_id ? Number(req.body.user_id) : undefined,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            file: file,
        }
    })
}
