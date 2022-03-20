import { Request, Response, TurboServer } from "./web/turbo"

import { UserCommandRepository } from "./infrastructure/prisma/repository/command/User"
import config from "./config/app"

async function startServer() {
    const server = new TurboServer(
        {
            maxParamLength: 128,
            defaultRoute: (req: Request, res: Response) => {
                res.setHeader("Content-Type", "application/json")
                res.setStatusCode(404)
                res.write(
                    Buffer.from(
                        JSON.stringify({
                            ok: false,
                            error: "endpoint_not_found",
                        })
                    )
                )
                res.end()
            },
        },
        new UserCommandRepository()
    )

    // routerにendpointを登録
    console.log("Register endpoints")
    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/auth/cookie/authenticate"))
    server.register(require("./web/endpoint/auth/twitter/request_token"))
    server.register(require("./web/endpoint/auth/twitter/authenticate"))
    server.register(require("./web/endpoint/channel_group/create"))
    // server.register(require("./web/endpoint/debug"))

    server.listen(config.server.port)
}

startServer()
    .then(() => {
        console.group("Server running")
    })
    .catch((error) => {
        console.log(error)
    })
