import authenticate, { facts } from "../../../api/methods/auth/cookie/authenticate"

import { TurboServer } from "../../../turbo"
import { getRemoteIpAddress } from "../../../remoteIpAddress"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = getRemoteIpAddress(req.headers)
        const sessionId = req.cookies["session_id"]
        const [user, authenticityToken] = await authenticate({ session_id: sessionId }, remoteIpAddress, null, null)
        return {
            ok: true,
            user: user.toJsonObject(),
            authenticity_token: authenticityToken.token,
        }
    })
}
