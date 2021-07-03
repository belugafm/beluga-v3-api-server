import { InternalErrorSpec, WebApiRuntimeError } from "../../api/error"
import signup, { facts } from "../../api/methods/account/signup"

import { TurboServer } from "../../turbo"
import config from "../../../config/app"
import { invalidate_last_login_session } from "../../auth"

export default (server: TurboServer) => {
    server.post(
        facts,
        async (req, res, params) => {
            const user = await signup(
                {
                    name: req.body.name,
                    password: req.body.password,
                    confirmationPassword: req.body.confirmed_password,
                    ipAddress: params["ip_address"],
                },
                null
            )
            // res.setCookie("user_id", session.user_id.toHexString(), {
            //     expires: session.expire_date,
            //     domain: config.server.domain,
            //     path: "/",
            //     httpOnly: true,
            // })
            // res.setCookie("session_id", session._id.toHexString(), {
            //     expires: session.expire_date,
            //     domain: config.server.domain,
            //     path: "/",
            //     httpOnly: true,
            // })
            // res.setCookie("session_token", session.session_token, {
            //     expires: session.expire_date,
            //     domain: config.server.domain,
            //     path: "/",
            //     httpOnly: true,
            // })
            return {
                ok: true,
            }
        },
        {
            fraud_prevention_rule: StrictRule,
        }
    )
}
