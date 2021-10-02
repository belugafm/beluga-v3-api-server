import { v4 } from "uuid"

export class Entity {
    uuid: string
    constructor() {
        this.uuid = v4()
    }
    print() {
        console.log(this.constructor.name, "{")
        for (const key in this) {
            console.log("    ", key, ":", this[key])
        }
        console.log("}")
    }
}
