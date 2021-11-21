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
    dict() {
        const ret: { [key: string]: any } = {}
        for (const key in this) {
            ret[key] = this[key]
        }
        return ret
    }
    toResponseObject() {
        throw Error("not_implemented")
    }
}
