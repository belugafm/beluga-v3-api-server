import uploadFile, { facts } from "../api/methods/upload"

import { TurboServer } from "../turbo"
import { getRemoteIpAddress } from "../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        await uploadFile(
            {
                file: req.body.file,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
        }
    })
}
