import { InternalErrorSpec, WebApiRuntimeError } from "../../api/error"
import signup, { facts } from "../../api/methods/account/signup"

import { TurboServer } from "../../turbo"
import config from "../../../config/app"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const user = await signup(
            {
                name: req.body.name,
                password: req.body.password,
                confirmationPassword: req.body.confirmed_password,
                ipAddress: params["ipAddress"],
            },
            null
        )
        if (user == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        const session = user.loginSession
        if (session == null) {
            throw new WebApiRuntimeError(new InternalErrorSpec())
        }
        res.setCookie("user_id", `${session.userId}`, {
            expires: session.expireDate,
            domain: config.server.domain,
            path: "/",
            httpOnly: true,
        })
        res.setCookie("session_id", session.sessionId, {
            expires: session.expireDate,
            domain: config.server.domain,
            path: "/",
            httpOnly: true,
        })
        return {
            ok: true,
        }
    })
}
