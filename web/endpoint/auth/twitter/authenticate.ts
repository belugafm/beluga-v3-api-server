import authenticate, { facts } from "../../../api/methods/auth/twitter/authenticate"

import { TurboServer } from "../../../turbo"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const user = await authenticate(
            {
                oauth_token: req.body.oauth_token,
                oauth_verifier: req.body.oauth_verifier,
                ip_address: remoteIpAddress,
            },
            remoteIpAddress,
            null
        )
        if (user == null) {
            return {
                ok: false,
            }
        }
        return {
            ok: true,
            user: user.toResponseObject(),
        }
    })
}
