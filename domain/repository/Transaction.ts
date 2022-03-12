export interface ITransactionRepository<T> {
    begin(): void
    commit(): void
    rollback(): void
    end(): void
    $transaction(func: () => T): Promise<T>
}
