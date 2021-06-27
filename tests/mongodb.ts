import { MongoMemoryReplSet } from "mongodb-memory-server"
import { UserModel } from "../infrastructure/mongodb/schema/user"
import mongoose from "mongoose"
import { sleep } from "./functions"

class MongoDBTestEnvironment {
    replSet?: MongoMemoryReplSet
    async connect() {
        const replSet = new MongoMemoryReplSet({
            replSet: { storageEngine: "wiredTiger" },
        })
        this.replSet = replSet
        return new Promise(async (resolve, reject) => {
            replSet.waitUntilRunning().then(() => {
                replSet.getUri().then(async (uri) => {
                    mongoose.connect(uri, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        useCreateIndex: true,
                        poolSize: 100,
                    })
                    mongoose.connection.once("open", async () => {
                        // トランザクション中はcollectionの作成ができないので
                        // 最初に作っておく
                        try {
                            await UserModel.createCollection()
                        } catch (error) {}

                        // 数秒待機する
                        sleep(3)

                        resolve(null)
                    })
                })
            })
        })
    }
    async disconnect() {
        await mongoose.disconnect()
        if (this.replSet) {
            await this.replSet.stop()
        }
    }
}

export const db = new MongoDBTestEnvironment()
