export class ChangeEventHandler {
    // 型定義用のダミー
    static subscribe(func: (changedId: any) => void) {}
    static deleteAllEventHandlers() {}
    static getEventListerSize() {}
    static eventListeners: ((changedId: any) => void)[] = []
    async emitChanges(changedId: number | string) {}
}

export function assignChangeEventHandlerProperties<T extends typeof ChangeEventHandler>(cls: T): T {
    Object.assign(cls, {
        eventListeners: [],
        subscribe: (func: (changedId: any) => void) => {
            cls.eventListeners.push(func)
        },
        deleteAllEventHandlers: () => {
            cls.eventListeners = []
        },
        getEventListerSize: () => {
            return cls.eventListeners.length
        },
    })
    Object.assign(cls.prototype, {
        emitChanges: (changedEntityId: any) => {
            cls.eventListeners.forEach((func: any) => {
                func(changedEntityId)
            })
        },
    })
    return cls
}
