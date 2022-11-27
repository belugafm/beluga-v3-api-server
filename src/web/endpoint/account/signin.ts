import signin, { facts } from "../../api/methods/account/signin"

import { TurboServer } from "../../turbo"
import config from "../../../config/app"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const [user, _, loginSession] = await signin(
            {
                name: req.body.name,
                password: req.body.password,
                last_location: "Tokyo, Japan",
                device: "Chrome on Linux",
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
