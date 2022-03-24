import { LoginCredentialModel } from "../infrastructure/mongoose/schema/LoginCredential"
import { LoginSessionModel } from "../infrastructure/mongoose/schema/LoginSession"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import { UserModel } from "../infrastructure/mongoose/schema/User"
import mongoose from "mongoose"
import { sleep } from "./functions"

class MongoDBTestEnvironment {
    replSet?: MongoMemoryReplSet
    async connect() {
        this.replSet = new MongoMemoryReplSet({
            replSet: { storageEngine: "wiredTiger" },
        })
        await this.replSet.start()
        await this.replSet.waitUntilRunning()
        const uri = await this.replSet.getUri()
        await mongoose.connect(uri)
        await UserModel.createCollection()
        await LoginCredentialModel.createCollection()
        await LoginSessionModel.createCollection()
        await sleep(3)
    }
    async disconnect() {
        await mongoose.disconnect()
        if (this.replSet) {
            await this.replSet.stop()
        }
    }
}

export const db = new MongoDBTestEnvironment()
