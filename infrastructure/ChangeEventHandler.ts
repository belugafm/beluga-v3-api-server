export class ChangeEventHandler {
    static subscribe(func: any) {}
    protected static _eventListeners: ((changedId: EntityId) => void)[] = []
    protected emitChanges(changedEntityId: EntityId) {}
    constructor(cls: any) {
        if (cls.hasOwnProperty("_eventListeners")) {
            return
        }
        Object.assign(cls, {
            _eventListeners: [],
            subscribe: (func: any) => {
                cls._eventListeners.push(func)
            },
        })
        cls.prototype.emitChanges = function (changedEntityId: EntityId) {
            cls._eventListeners.forEach((func: any) => {
                func(changedEntityId)
            })
        }
    }
}
