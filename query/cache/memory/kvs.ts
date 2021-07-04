export class CachedObject {
    expireDate: Date
    value: any
    constructor(value: any, expireSeconds: number) {
        this.value = value
        this.expireDate = new Date(Date.now() + expireSeconds * 1000)
    }
    expired() {
        if (this.expireDate.getTime() < Date.now()) {
            return true
        } else {
            return false
        }
    }
}

export class InMemoryCache {
    cacheLimit: number
    defaultExpireSeconds: number
    data: { [key: string]: CachedObject }
    constructor(cacheLimit: number, default_expire_seconds: number) {
        this.cacheLimit = cacheLimit
        this.defaultExpireSeconds = default_expire_seconds
        this.data = {}
    }
    get(key: string): any {
        if (key in this.data !== true) {
            return null
        }
        const cachedObject = this.data[key]
        if (cachedObject.expired() == true) {
            delete this.data[key]
            return null
        }
        return cachedObject.value
    }
    set(key: string, value: any, expireSeconds?: number): void {
        // @ts-ignore
        if (this.data.length > this.cacheLimit) {
            this.data = {}
        }
        this.data[key] = new CachedObject(
            value,
            expireSeconds ? expireSeconds : this.defaultExpireSeconds
        )
    }
    delete(key: string) {
        if (key in this.data) {
            delete this.data[key]
        }
    }
}
