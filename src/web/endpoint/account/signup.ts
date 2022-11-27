import signupWithoutName, { facts } from "../../api/methods/account/signup_without_name"

import { TurboServer } from "../../turbo"
import config from "../../../config/app"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const [user, _, loginSession] = await signupWithoutName(
            {
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
            // ユーザー名は乱数なのでCookieに保存して入力補助する
            res.setCookie("user_name", user.name, {
                expires: new Date(Date.now() + 86400 * 365 * 1000),
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
