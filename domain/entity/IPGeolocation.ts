import * as vn from "../validation"

import { Entity } from "./Entity"
import { validateBy } from "../validation/validateBy"

export const ErrorCodes = {
    InvalidCountry: "invalid_country",
    InvalidRegion: "invalid_region",
    InvalidIsp: "invalid_isp",
    InvalidTor: "invalid_tor",
} as const

export class IPGeolocationEntity extends Entity {
    @validateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidCountry })
    country: string | null

    @validateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidRegion })
    region: string | null

    @validateBy(vn.string(), { nullable: true, errorCode: ErrorCodes.InvalidIsp })
    isp: string | null

    @validateBy(vn.boolean(), { errorCode: ErrorCodes.InvalidTor })
    tor: boolean

    constructor(params: IPGeolocationEntity) {
        super()
        this.country = params.country
        this.region = params.region
        this.isp = params.isp
        this.tor = params.tor
    }
}
