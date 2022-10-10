let _with_transaction = false

export function WithTransaction(): boolean {
    return _with_transaction
}
export function SetWithTransaction(on_off: boolean): void {
    _with_transaction = on_off
}
