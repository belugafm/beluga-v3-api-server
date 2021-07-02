export interface ITransactionRepository {
    begin(): void
    commit(): void
    rollback(): void
    end(): void
}
