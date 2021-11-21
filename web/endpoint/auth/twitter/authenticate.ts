import authenticate, { facts } from "../../../api/methods/auth/twitter/authenticate"

import { TurboServer } from "../../../turbo"
import config from "../../../../config/app"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const authSessionId = req.cookies["tw_auth_session_id"]
        const [user, loginSession, _] = await authenticate(
            {
                oauth_token: req.body.oauth_token,
                oauth_verifier: req.body.oauth_verifier,
                auth_session_id: authSessionId,
                ip_address: remoteIpAddress,
            },
            remoteIpAddress,
            null
        )
        if (loginSession) {
            res.setCookie("session_id", loginSession.sessionId, {
                expires: loginSession.expireDate,
                domain: config.server.domain,
                path: "/",
                httpOnly: true,
                secure: config.server.https,
            })
        }
        return {
            ok: true,
            user: user.toResponseObject(),
        }
    })
}
