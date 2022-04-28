import { Request, Response, TurboServer } from "./web/turbo"

import { LoginCredentialModel } from "./infrastructure/mongoose/schema/LoginCredential"
import { LoginSessionModel } from "./infrastructure/mongoose/schema/LoginSession"
import { MongoClient } from "mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { UserCommandRepository } from "./infrastructure/mongoose/repository/command/User"
import { UserModel } from "./infrastructure/mongoose/schema/User"
import config from "./src/config/app"
import mongoose from "mongoose"

async function createCollections() {
    try {
        await UserModel.createCollection()
    } catch (error) {}
    try {
        await LoginSessionModel.createCollection()
    } catch (error) {}
    try {
        await LoginCredentialModel.createCollection()
    } catch (error) {}
}

// async function initialize() {
//     try {
//         await signup(
//             {
//                 name: config.admin.name,
//                 password: config.admin.password,
//                 confirmationPassword: config.admin.password,
//                 ipAddress: "0.0.0.0",
//             },
//             null
//         )
//     } catch (error) {}
// }

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

    // トランザクション中はcollectionの作成ができないので先に作っておく
    await createCollections()

    // await initialize()

    // routerにendpointを登録
    console.log("Register endpoints")
    server.register(require("./web/endpoint/account/signup"))
    server.register(require("./web/endpoint/auth/cookie/authenticate"))
    server.register(require("./web/endpoint/auth/twitter/request_token"))
    server.register(require("./web/endpoint/auth/twitter/authenticate"))
    // server.register(require("./web/endpoint/debug"))

    server.listen(config.server.port)
}

if (true) {
    const replSet = new MongoMemoryReplSet({
        replSet: { storageEngine: "wiredTiger" },
    })
    replSet
        .start()
        .then(async () => {
            console.log("replSet start")
            await replSet.waitUntilRunning()
            console.log("replSet waitUntilRunning")
            const uri = await replSet.getUri()
            await mongoose.connect(uri)
            console.log("Connect mongoose")
            mongoose.connection.on("error", (err) => {
                console.error(err)
            })
            // mongoose.connection.once("open", async () => {
            // })
            await startServer()
            console.group("Server running on:")
            console.log("Mongo:", uri)
            console.log("Web:", `${config.server.domain}:${config.server.port}`)
            console.groupEnd()
        })
        .catch((error) => {
            console.error(error)
        })
} else {
    // 先にdocker-compose upしておく
    const uri = "mongodb://localhost:27017"
    MongoClient.connect(uri)
        .then((mongodb) => {
            startServer()
        })
        .catch((reason) => {
            console.log(reason)
        })
}
