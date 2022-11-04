import generateRequestToken, { facts } from "../../api/methods/oauth/request_token"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const response = await generateRequestToken(
            {
                consumer_key: req.body.consumer_key,
                consumer_secret: req.body.consumer_secret,
            },
            remoteIpAddress,
            null,
            params["authApp"]
        )
        if (response == null) {
            return {
                ok: false,
            }
        }
        return {
            ok: true,
            request_token: response.token,
            request_token_secret: response.secret,
        }
    })
}
