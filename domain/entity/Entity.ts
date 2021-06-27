import { v4 } from "uuid"

export class Entity {
    uuid: string
    constructor() {
        this.uuid = v4()
    }
}
