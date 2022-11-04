import {
    AuthenticityTokenQueryRepository,
    LoginSessionQueryRepository,
    UserQueryRepository,
    ApplicationQueryRepository,
    AccessTokenQueryRepository,
    RequestTokenQueryRepository,
} from "./web/repositories"
import { Request, Response, TurboServer } from "./web/turbo"

import { UserAuthenticator } from "./web/authentication/user"
import { ApplicationAuthenticator } from "./web/authentication/application"
import { CookieAuthenticationApplication } from "./application/authentication/Cookie"
import { UserCommandRepository } from "./infrastructure/prisma/repository/command/User"
import { ChannelCommandRepository } from "./infrastructure/prisma/repository/command/Channel"
import { ChannelGroupCommandRepository } from "./infrastructure/prisma/repository/command/ChannelGroup"
import { MessageCommandRepository } from "./infrastructure/prisma/repository/command/Message"
import config from "./config/app"
import WebSocket, { WebSocketServer } from "ws"
import { UserId } from "../src/domain/types"
import { AuthenticateUserByAccessTokenApplication } from "./application/oauth/AuthenticateUserByAccessToken"
import { OAuthAuthenticateAppApplication } from "./application/oauth/AuthenticateApp"
import { AuthenticateUserByRequestTokenApplication } from "./application/oauth/AuthenticateUserByRequestToken"

function startWebsocketServer() {
    const wss = new WebSocketServer({
        port: config.server.websocket_port,
    })
    // wss.on("connection", (ws: any, request: any, client: any) => {
    //     console.log(wss.clients.size)
    // })
    const broadcast = (data: { [key: string]: any }) => {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data))
            }
        })
    }
    UserCommandRepository.subscribe((userId: UserId) => {
        broadcast({
            user_id: userId,
        })
    })
    ChannelCommandRepository.subscribe((channelId: UserId) => {
        broadcast({
            channel_id: channelId,
        })
    })
    ChannelGroupCommandRepository.subscribe((channelGroupId: UserId) => {
        broadcast({
            channel_group_id: channelGroupId,
        })
    })
    MessageCommandRepository.subscribe((messageId: UserId) => {
        broadcast({
            message_id: messageId,
        })
    })
    return wss
}

async function startAPIServer() {
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
        new UserAuthenticator(
            new CookieAuthenticationApplication(
                new UserQueryRepository(),
                new LoginSessionQueryRepository(),
                new AuthenticityTokenQueryRepository()
            ),
            new AuthenticateUserByAccessTokenApplication(
                new AccessTokenQueryRepository(),
                new ApplicationQueryRepository(),
                new UserQueryRepository()
            ),
            new AuthenticateUserByRequestTokenApplication(
                new RequestTokenQueryRepository(),
                new ApplicationQueryRepository(),
                new UserQueryRepository()
            )
        ),
        new ApplicationAuthenticator(new OAuthAuthenticateAppApplication(new ApplicationQueryRepository()))
    )

    // routerにendpointを登録
    console.log("Register endpoints")
    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/account/signin"))
    server.register(require("./web/endpoint/app/create"))
    server.register(require("./web/endpoint/app/list_app"))
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
    server.register(require("./web/endpoint/message/show"))
    server.register(require("./web/endpoint/likes/create"))
    server.register(require("./web/endpoint/favorites/create"))
    server.register(require("./web/endpoint/favorites/destroy"))
    server.register(require("./web/endpoint/timeline/channel"))
    server.register(require("./web/endpoint/timeline/channel_debug"))
    server.register(require("./web/endpoint/timeline/channel_group"))
    server.register(require("./web/endpoint/upload/media"))
    server.register(require("./web/endpoint/oauth/request_token"))
    server.register(require("./web/endpoint/oauth/authorize"))
    server.register(require("./web/endpoint/oauth/access_token"))
    // server.register(require("./web/endpoint/debug"))

    server.listen(config.server.port)
}

async function main() {
    await startAPIServer()
    startWebsocketServer()
}
main()
    .then(() => {
        console.log(`API Server running on localhost:${config.server.port}`)
        console.log(`WebSocket Server running on localhost:${config.server.websocket_port}`)
    })
    .catch((error) => {
        console.error(error)
    })
