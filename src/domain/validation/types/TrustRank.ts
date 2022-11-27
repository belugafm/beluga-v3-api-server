import { Options } from "./String"
import { PropertyValidator } from "../PropertyValidator"
import { checkIsString } from "../validator/string/isString"
import { TrustRank } from "../../../config/trust_level"
import { CommonErrorMessages, ValidationError } from "../error"

function checkIsTrustRank(value: string, options: Options): void {
    // @ts-ignore
    if ([TrustRank.RiskyUser, TrustRank.Visitor, TrustRank.AuthorizedUser, TrustRank.Moderator].includes(value)) {
        return
    }
    throw new ValidationError(CommonErrorMessages.InvalidType)
}

export function TrustRankValidator() {
    return new PropertyValidator<string>({}, [checkIsString, checkIsTrustRank])
}
