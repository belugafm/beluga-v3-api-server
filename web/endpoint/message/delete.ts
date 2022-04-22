import deleteMessage, { facts } from "../../api/methods/message/delete"

import { TurboServer } from "../../turbo"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const succeeded = await deleteMessage(
            {
                id: Math.trunc(req.body.id),
            },
            remoteIpAddress,
            params["authUser"]
        )
        return {
            ok: succeeded,
        }
    })
}
