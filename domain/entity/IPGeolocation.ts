import * as vn from "../validation"

import { Entity } from "./Entity"
import { ValidateBy } from "../validation/ValidateBy"

export const ErrorCodes = {
    InvalidCountry: "invalid_country",
    InvalidRegion: "invalid_region",
    InvalidIsp: "invalid_isp",
    InvalidTor: "invalid_tor",
} as const

export class IPGeolocationEntity extends Entity {
    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidCountry })
    country: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidRegion })
    region: string | null

    @ValidateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidIsp })
    isp: string | null

    @ValidateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidTor })
    tor: boolean

    constructor(params: UserEntity) {
        super()
        this.country = params.country
        this.region = params.region
        this.isp = params.isp
        this.tor = params.tor
    }
}
