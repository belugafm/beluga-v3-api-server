import getRequestToken, { facts } from "../../../api/methods/auth/twitter/request_token"

import { TurboServer } from "../../../turbo"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const response = await getRequestToken({}, remoteIpAddress, null)
        if (response == null) {
            return {
                ok: false,
            }
        }
        return {
            ok: true,
            oauth_token: response.oauthToken,
            oauth_token_secret: response.oauthTokenSecret,
        }
    })
}
