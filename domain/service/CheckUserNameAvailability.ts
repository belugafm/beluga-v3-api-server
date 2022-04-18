import { DomainError } from "../DomainError"
import { IUserQueryRepository } from "../repository/query/User"

export const ErrorCodes = {
    NameTaken: "name_taken",
} as const

export class CheckUserNameAvailabilityService {
    private usersRepository: IUserQueryRepository
    constructor(usersRepository: IUserQueryRepository) {
        this.usersRepository = usersRepository
    }
    async isNameTaken(name: string) {
        const user = await this.usersRepository.findByName(name)
        if (user === null) {
            return false
        }
        return true
    }
    async hasThrow(name: string) {
        if (await this.isNameTaken(name)) {
            throw new DomainError(ErrorCodes.NameTaken)
        }
    }
}
