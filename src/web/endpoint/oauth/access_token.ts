import generateAccessToken, { facts } from "../../api/methods/oauth/access_token"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const [token, app] = await generateAccessToken(
            {
                consumer_key: req.body.consumer_key,
                consumer_secret: req.body.consumer_secret,
                request_token: req.body.request_token,
                request_token_secret: req.body.request_token_secret,
                verifier: req.body.verifier,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            request_token: token.token,
            request_token_secret: token.secret,
            app: app,
        }
    })
}
