import generateAccessToken, { facts } from "../../api/methods/oauth/access_token"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const token = await generateAccessToken(
            {
                request_token: req.body.request_token,
                verifier: req.body.verifier,
            },
            remoteIpAddress,
            params["authUser"],
            params["authApp"]
        )
        return {
            ok: true,
            access_token: token.token,
            access_token_secret: token.secret,
        }
    })
}
