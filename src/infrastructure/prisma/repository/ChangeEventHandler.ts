import { WithTransaction } from "./WithTransaction"

export class ChangeEventHandler {
    // 型定義用のダミー
    static subscribe(func: (changedId: any) => void) {}
    static deleteAllEventHandlers() {}
    static getEventListerSize() {}
    static eventListeners: ((changedId: any) => void)[] = []
    static changedEntityIds: Set<any> = new Set()
    static lazyEmitChanges() {}
    emitChanges(changedId: number | string) {}
}

export function assignChangeEventHandlerProperties<T extends typeof ChangeEventHandler>(cls: T): T {
    Object.assign(cls, {
        eventListeners: [],
        changedEntityIds: new Set(),
        subscribe: (func: (changedId: any) => void) => {
            cls.eventListeners.push(func)
        },
        deleteAllEventHandlers: () => {
            cls.eventListeners = []
        },
        getEventListerSize: () => {
            return cls.eventListeners.length
        },
        lazyEmitChanges: () => {
            cls.eventListeners.forEach((func: any) => {
                for (const changedEntityId of cls.changedEntityIds) {
                    func(changedEntityId)
                }
            })
            cls.changedEntityIds.clear()
        },
    })
    Object.assign(cls.prototype, {
        emitChanges: (changedEntityId: any) => {
            if (WithTransaction()) {
                cls.changedEntityIds.add(changedEntityId)
            } else {
                cls.eventListeners.forEach((func: any) => {
                    func(changedEntityId)
                })
            }
        },
    })
    return cls
}
