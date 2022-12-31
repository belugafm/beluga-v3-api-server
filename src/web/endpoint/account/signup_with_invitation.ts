import signup, { facts } from "../../api/methods/account/signup_with_invitation"

import { TurboServer } from "../../turbo"
import config from "../../../config/app"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const [user, _, loginSession] = await signup(
            {
                name: req.body.name,
                invite_verifier: req.body.invite_verifier,
                password: req.body.password,
                confirmation_password: req.body.confirmation_password,
                ip_address: remoteIpAddress,
            },
            remoteIpAddress,
            null,
            null
        )
        if (loginSession) {
            res.setCookie("session_id", loginSession.sessionId, {
                expires: loginSession.expireDate,
                path: "/",
                httpOnly: true,
                secure: config.server.https,
            })
        }
        return {
            ok: true,
            user: user.toJsonObject(),
        }
    })
}
