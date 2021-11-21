export class CachedObject<T> {
    expireDate: Date
    value: T
    constructor(value: T, expireSeconds: number) {
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

export class InMemoryCache<T> {
    private cacheLimit: number // キャッシュの容量
    private defaultExpireSeconds: number
    private data: { [key: string]: CachedObject<T> }
    constructor(params: { cacheLimit: number; defaultExpireSeconds: number }) {
        this.cacheLimit = params.cacheLimit
        this.defaultExpireSeconds = params.defaultExpireSeconds
        this.data = {}
    }
    clear() {}
    get(key: string): T | null {
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
        if (Object.keys(this.data).length >= this.cacheLimit) {
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
