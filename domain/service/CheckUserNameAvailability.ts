import { IUsersRepository } from "../repository/Users"
import { DomainError } from "../error"

export const ErrorCodes = {
    NameTaken: "name_taken",
} as const

export class CheckUserNameAvailabilityService {
    private usersRepository: IUsersRepository
    constructor(usersRepository: IUsersRepository) {
        this.usersRepository = usersRepository
    }
    isNameTaken(name: string): boolean {
        const user = this.usersRepository.findByName(name)
        if (user === null) {
            return false
        }
        return true
    }
    tryCheckIfNameIsTaken(name: string): void {
        if (this.isNameTaken(name)) {
            throw new DomainError(ErrorCodes.NameTaken)
        }
    }
}
