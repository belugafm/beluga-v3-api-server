import { EntityId } from "../domain/types"

export class ChangeEventHandler {
    static subscribe(func: (changedId: any) => void) {}
    protected static _eventListeners: ((changedId: any) => void)[] = []
    protected async emitChanges(changedEntityId: EntityId) {}
    constructor(cls: any) {
        if (cls.hasOwnProperty("_eventListeners")) {
            return
        }
        Object.assign(cls, {
            _eventListeners: [],
            subscribe: (func: (changedId: any) => void) => {
                cls._eventListeners.push(func)
            },
        })
        cls.prototype.emitChanges = function (changedEntityId: any) {
            cls._eventListeners.forEach((func: any) => {
                func(changedEntityId)
            })
        }
    }
}
