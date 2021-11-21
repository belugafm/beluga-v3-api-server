import getRequestToken, { facts } from "../../../api/methods/auth/twitter/request_token"

import { TurboServer } from "../../../turbo"
import { authSessionExpireSeconds } from "../../../../application/authentication/Twitter"
import config from "../../../../config/app"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const response = await getRequestToken({}, remoteIpAddress, null)
        if (response == null) {
            return {
                ok: false,
            }
        }
        if (response.authSessionId) {
            res.setCookie("tw_auth_session_id", response.authSessionId, {
                expires: new Date(Date.now() + authSessionExpireSeconds * 1000),
                domain: config.server.domain,
                path: "/",
                httpOnly: true,
                secure: config.server.https,
            })
        }
        return {
            ok: true,
            oauth_token: response.oauthToken,
            oauth_token_secret: response.oauthTokenSecret,
        }
    })
}
