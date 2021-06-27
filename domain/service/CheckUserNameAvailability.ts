import { DomainError } from "../DomainError"
import { IUsersRepository } from "../repository/Users"

export const ErrorCodes = {
    NameTaken: "name_taken",
} as const

export class CheckUserNameAvailabilityService {
    private usersRepository: IUsersRepository
    constructor(usersRepository: IUsersRepository) {
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
