import { AuthenticityTokenQueryRepository, LoginSessionQueryRepository, UserQueryRepository } from "./web/repositories"
import { Request, Response, TurboServer } from "./web/turbo"

import { Authenticator } from "./web/auth"
import { CookieAuthenticationApplication } from "./application/authentication/Cookie"
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
        new UserCommandRepository(),
        new Authenticator(
            new CookieAuthenticationApplication(
                new UserQueryRepository(),
                new LoginSessionQueryRepository(),
                new AuthenticityTokenQueryRepository()
            )
        )
    )

    // routerにendpointを登録
    console.log("Register endpoints")
    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/account/signin"))
    server.register(require("./web/endpoint/auth/cookie/authenticate"))
    server.register(require("./web/endpoint/auth/twitter/request_token"))
    server.register(require("./web/endpoint/auth/twitter/authenticate"))
    server.register(require("./web/endpoint/channel_group/create"))
    server.register(require("./web/endpoint/channel_group/show"))
    server.register(require("./web/endpoint/channel_group/list_channels"))
    server.register(require("./web/endpoint/channel_group/list_channel_groups"))
    server.register(require("./web/endpoint/channel/create"))
    server.register(require("./web/endpoint/channel/show"))
    server.register(require("./web/endpoint/channel/list_channels"))
    server.register(require("./web/endpoint/message/post"))
    server.register(require("./web/endpoint/message/delete"))
    server.register(require("./web/endpoint/timeline/channel"))
    server.register(require("./web/endpoint/timeline/channel_group"))
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
