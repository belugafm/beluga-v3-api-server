import createInvite, { facts } from "../../api/methods/invites/create"

import { TurboServer } from "../../turbo"
import { getRemoteIpAddress } from "../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const invite = await createInvite({}, remoteIpAddress, params["authUser"], null)
        return {
            ok: true,
            invite: invite,
        }
    })
}
