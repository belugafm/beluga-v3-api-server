import { IsAnyString, IsBoolean } from "../validation/decorators"

import { Entity } from "./Entity"

export const ErrorCodes = {
    InvalidCountry: "invalid_country",
    InvalidRegion: "invalid_region",
    InvalidIsp: "invalid_isp",
    InvalidTor: "invalid_tor",
} as const

export class IPGeolocationEntity extends Entity {
    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidCountry })
    country: string | null

    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidRegion })
    region: string | null

    @IsAnyString({ nullable: true, errorCode: ErrorCodes.InvalidIsp })
    isp: string | null

    @IsBoolean({ errorCode: ErrorCodes.InvalidTor })
    tor: boolean

    constructor(params: IPGeolocationEntity) {
        super()
        this.country = params.country
        this.region = params.region
        this.isp = params.isp
        this.tor = params.tor
    }
}
