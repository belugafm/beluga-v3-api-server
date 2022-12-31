import showInvite, { facts } from "../../api/methods/invites/show"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const verifier = await showInvite(
            {
                verifier: req.query.verifier,
            },
            remoteIpAddress,
            params["authUser"],
            null
        )
        return {
            ok: true,
            verifier: verifier,
        }
    })
}
