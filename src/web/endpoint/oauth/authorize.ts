import authorize, { facts } from "../../api/methods/oauth/authorize"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const [verifier, app] = await authorize(
            {
                consumer_key: req.body.consumer_key,
                consumer_secret: req.body.consumer_secret,
                request_token: req.body.request_token,
                request_token_secret: req.body.request_token_secret,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            verifier,
            app,
        }
    })
}
