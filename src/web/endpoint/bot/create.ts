import createBot, { facts } from "../../api/methods/bot/create"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"
import { isString } from "../../../domain/validation"

const stringOrNull = (value: any) => {
    if (isString(value) && value.length > 0) {
        return value
    }
    return undefined
}

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const [user, accessToken] = await createBot(
            {
                name: req.body.name,
                display_name: stringOrNull(req.body.display_name),
                description: stringOrNull(req.body.description),
                application_id: Number(req.body.application_id),
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            user: user,
            access_token: accessToken.token,
            access_token_secret: accessToken.secret,
        }
    })
}
