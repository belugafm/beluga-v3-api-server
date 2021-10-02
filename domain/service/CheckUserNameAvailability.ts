import { DomainError } from "../DomainError"
import { IUsersQueryRepository } from "../repository/query/Users"

export const ErrorCodes = {
    NameTaken: "name_taken",
} as const

export class CheckUserNameAvailabilityService {
    private usersRepository: IUsersQueryRepository
    constructor(usersRepository: IUsersQueryRepository) {
        this.usersRepository = usersRepository
    }
    async isNameTaken(name: string) {
        const user = await this.usersRepository.findByName(name)
        if (user === null) {
            return false
        }
        return true
    }
    async tryCheckIfNameIsTaken(name: string) {
        if (await this.isNameTaken(name)) {
            throw new DomainError(ErrorCodes.NameTaken)
        }
    }
}
