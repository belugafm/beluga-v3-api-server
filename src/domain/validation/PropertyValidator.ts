export class PropertyValidator<T> {
    // validatorの対応する型を推論するためにダミーの関数を作って組み込み関数ReturnTypeで型を推論する
    type(value: T) {
        return value
    }
    options: { [key: string]: any }
    validationFuncs: ((value: T, options: { [key: string]: any }) => void)[]
    constructor(options: { [key: string]: any }, validationFuncs: any[]) {
        this.options = options
        this.validationFuncs = validationFuncs
    }
    async check(value: T): Promise<boolean> {
        for (const check of this.validationFuncs) {
            await check(value, this.options)
        }
        return true
    }
    ok(value: T): boolean {
        try {
            this.validationFuncs.forEach((check) => {
                check(value, this.options)
            })
        } catch (error) {
            return false
        }
        return true
    }
}
