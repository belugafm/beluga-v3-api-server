import createApp, { facts } from "../../api/methods/app/create"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const app = await createApp(
            {
                name: req.body.name,
                description: req.body.description,
                callback_url: req.body.callback_url,
                read: req.body.read,
                write: req.body.write,
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: true,
            app: app.toJsonObject(),
            consumer_key: app.token,
            consumer_secret: app.secret,
        }
    })
}
