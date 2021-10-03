import debug, { facts } from "../api/methods/debug"

import { TurboServer } from "../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const user = await debug(
            {
                name: req.body.name,
            },
            null
        )
        return {
            ok: true,
            user: user,
        }
    })
}
