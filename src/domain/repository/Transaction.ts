export interface ITransactionRepository<T> {
    // begin(): void
    // commit(): void
    // rollback(): void
    // end(): void
    $transaction(func: (session: any) => T): Promise<T>
}
