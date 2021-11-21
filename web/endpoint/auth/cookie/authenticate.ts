import authenticate, { facts } from "../../../api/methods/auth/cookie/authenticate"

import { TurboServer } from "../../../turbo"

export default (server: TurboServer) => {
    server.post(facts, async (req, res, params) => {
        const remoteIpAddress = req.headers["x-real-ip"]
        const sessionId = req.cookies["session_id"]
        const [user, authenticityToken] = await authenticate(
            { session_id: sessionId },
            remoteIpAddress,
            null
        )
        return {
            ok: true,
            user: user.toResponseObject(),
            authenticity_token: authenticityToken.token,
        }
    })
}
