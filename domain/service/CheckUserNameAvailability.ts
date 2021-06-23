import { IUsersRepository } from "../repository/Users"
import { ModelRuntimeError } from "../error"

export const ErrorCodes = {
    NameTaken: "name_taken",
}

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
            throw new ModelRuntimeError(ErrorCodes.NameTaken)
        }
    }
}
