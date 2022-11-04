import getRequestToken, { facts } from "../../../api/methods/auth/twitter/request_token"

import { TurboServer } from "../../../turbo"
import { authSessionExpireSeconds } from "../../../../application/authentication/Twitter"
import config from "../../../../config/app"
import { getRemoteIpAddress } from "../../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const response = await getRequestToken({}, remoteIpAddress, null, null)
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
        console.log("request token", response.token)
        console.log("request token secret", response.tokenSecret)
        return {
            ok: true,
            oauth_token: response.token,
            oauth_token_secret: response.tokenSecret,
        }
    })
}
