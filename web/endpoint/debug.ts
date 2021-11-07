import debug, { facts } from "../api/methods/debug"

import { TurboServer } from "../turbo"

export default (server: TurboServer) => {
    server.get(facts, async (req, res, params) => {
        const [user, loginSession] = await debug(
            {
                password: "hogehoge",
            },
            null
        )
        return {
            ok: true,
            user: user?.dict(),
            loginSession: loginSession?.dict(),
        }
    })
}
