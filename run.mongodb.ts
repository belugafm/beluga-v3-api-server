import { Request, Response, TurboServer } from "./web/turbo"

import { LoginCredentialModel } from "./infrastructure/mongodb/schema/LoginCredential"
import { LoginSessionModel } from "./infrastructure/mongodb/schema/LoginSession"
import { MongoClient } from "mongodb"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { UserModel } from "./infrastructure/mongodb/schema/User"
import config from "./config/app"
import mongoose from "mongoose"
import signup from "./web/api/methods/account/signup"

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

async function initialize() {
    try {
        await signup(
            {
                name: config.admin.name,
                password: config.admin.password,
                confirmationPassword: config.admin.password,
                ipAddress: "0.0.0.0",
            },
            null
        )
    } catch (error) {}
}

async function startServer() {
    const server = new TurboServer({
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
    })

    // トランザクション中はcollectionの作成ができないので先に作っておく
    await createCollections()

    await initialize()

    // routerにendpointを登録
    server.register(require("./web/endpoint/account/signup"))

    server.listen(config.server.port)
}

if (true) {
    const replSet = new MongoMemoryReplSet({
        replSet: { storageEngine: "wiredTiger" },
    })
    replSet.start().then(async () => {
        await replSet.waitUntilRunning()
        const uri = await replSet.getUri()
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,

            // change streamでwatchしている数よりも
            // 大きい値に設定する必要がある
            poolSize: 20,
        })
        mongoose.connection.on("error", (err) => {
            console.error(err)
        })
        mongoose.connection.once("open", async () => {
            await startServer()
            console.log("mongodb:", uri)
            console.log("web:", config.server.port)
        })
    })
} else {
    // 先にdocker-compose upしておく
    const uri = "mongodb://localhost:27017"
    MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then((mongodb) => {
            startServer()
        })
        .catch((reason) => {
            console.log(reason)
        })
}
