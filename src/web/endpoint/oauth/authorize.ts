import authorize, { facts } from "../../api/methods/oauth/authorize"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const verifier = await authorize(
            {
                request_token: req.body.request_token,
                request_token_secret: req.body.request_token_secret,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            verifier: verifier,
        }
    })
}
