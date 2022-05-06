import upload, { facts } from "../../api/methods/upload/media"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const files = await upload(
            {
                file: req.body.file,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            files: files.map((file) => file.toJsonObject()),
        }
    })
}
