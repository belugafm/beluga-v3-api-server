import signup_without_name, { facts } from "../../api/methods/account/signup_without_name"

import { TurboServer } from "../../turbo"
import config from "../../../config/app"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const [user, _, loginSession, __] = await signup_without_name(
            {
                password: req.body.password,
                confirmation_password: req.body.confirmation_password,
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
