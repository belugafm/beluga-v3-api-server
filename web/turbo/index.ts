import { InvalidContentTypeErrorSpec, WebApiRuntimeError } from "../api/error"
import { Request, Response, read_body } from "./turbo"

import { ContentTypesUnion } from "../api/facts/content_type"
import { IUsersCommandRepository } from "../../domain/repository/command/Users"
import { MethodFacts } from "../api/define"
import Router from "find-my-way"
import { UserEntity } from "../../domain/entity/User"
import { authenticate_user } from "../auth"
import config from "../../config/app"
import qs from "qs"
import turbo from "turbo-http"

export { Request, Response }

const DefaultRoute = (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.setStatusCode(404)
    res.write(
        Buffer.from(
            JSON.stringify({
                ok: false,
                error: "endpoint_not_found",
            })
        )
    )
    res.end()
}

const AccessDeniedRoute = (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.setStatusCode(403)
    res.write(
        Buffer.from(
            JSON.stringify({
                ok: false,
                error: "access_denied",
            })
        )
    )
    res.end()
}

declare module "find-my-way" {
    type Handler = (
        req: Request,
        res: Response,
        params: { ipAddress: string; authUser: UserEntity | null },
        store?: any
    ) => object | string
    type HTTPMethod = "GET" | "POST"
    interface Config {
        ignoreTrailingSlash?: boolean
        allowUnsafeRegex?: boolean
        caseSensitive?: boolean
        maxParamLength?: number
        defaultRoute?(req: Request, res: Response): void
        onBadUrl?(path: string, req: Request, res: Response): void
        versioning?: {
            storage(): {
                get(version: String): Handler | null
                set(version: String, store: Handler): void
                del(version: String): void
                empty(): void
            }
            deriveVersion(req: Request, ctx?: any): String
        }
    }
    interface ShortHandRoute {
        (path: string, handler: Handler): void
        (path: string, handler: Handler, store: any): void
    }
    interface Instance {
        on(method: HTTPMethod | HTTPMethod[], path: string, handler: Handler): void
        lookup(req: Request, res: Response, ctx?: any): void
        get: ShortHandRoute
        post: ShortHandRoute
        routes: string[]
    }
}

export const ContentType = {
    HTML: "text/html",
    JSON: "application/json",
}

// async function activate_user(user: UserEntity) {
//     if (user.dormant === true) {
//         return
//     }
//     if (user.active === true) {
//         return
//     }
//     user.active = true
//     await user.save()
// }

const base_url = "/api/v1/"

type Options = {}

export class TurboServer {
    router: Router.Instance
    server: turbo.Server
    usersRepository: IUsersCommandRepository
    constructor(opt: Router.Config, usersRepository: IUsersCommandRepository) {
        if (opt.defaultRoute == null) {
            opt.defaultRoute = DefaultRoute
        }
        this.usersRepository = usersRepository
        this.router = Router(opt)
        this.server = turbo.createServer(async (_req, _res) => {
            // アクセスがあるたびここを通る
            const req = new Request(_req)
            const res = new Response(_res)
            const { host } = req.headers
            const domain = host.split(":")[0]
            if (domain !== config.server.domain) {
                return AccessDeniedRoute(req, res)
            }
            return this.router.lookup(req, res)
        })
    }
    get(facts: MethodFacts, handler: Router.Handler, options: Options = {}) {
        if (facts.httpMethod !== "GET") {
            throw new Error("POSTリクエストが要求されているendpointをGETに登録することはできません")
        }
        this.router.get(base_url + facts.url, async (req, res, params) => {
            res.setHeader("Content-Type", ContentType.JSON)
            try {
                const query = qs.parse(req.url.replace(/^.+\?/, ""), {
                    decoder: decodeURIComponent,
                })
                req.query = query

                if (facts.authenticationRequired) {
                    // ユーザー認証をここで行う
                    const auth_user = await authenticate_user(facts, req.query, req.cookies)
                    params["authUser"] = auth_user
                }
                const data = await handler(req, res, params)
                res.write(Buffer.from(JSON.stringify(data)))
            } catch (error) {
                if (error instanceof Error) {
                    if (error instanceof WebApiRuntimeError) {
                        res.write(
                            Buffer.from(
                                JSON.stringify({
                                    ok: false,
                                    error_code: error.code,
                                    description: error.description,
                                    argument: error.argument,
                                    hint: error.hint,
                                    additional_message: error.additional_message,
                                    stack: null,
                                })
                            )
                        )
                    } else {
                        res.write(
                            Buffer.from(
                                JSON.stringify({
                                    ok: false,
                                    error_code: "unexpected_error",
                                    description: [error.toString()],
                                    stack: error.stack?.split("\n"),
                                })
                            )
                        )
                    }
                } else {
                    res.write(
                        Buffer.from(
                            JSON.stringify({
                                ok: false,
                                error_code: "unexpected_error",
                                description: ["unknown_error"],
                            })
                        )
                    )
                }
            }
            res.end()
        })
    }
    post(facts: MethodFacts, handler: Router.Handler, options: Options = {}) {
        if (facts.httpMethod !== "POST") {
            throw new Error("GETリクエストが要求されているendpointをPOSTに登録することはできません")
        }
        this.router.post(base_url + facts.url, async (req, res, params) => {
            res.setHeader("Content-Type", ContentType.JSON)
            res.setStatusCode(200)
            try {
                const body = await read_body(req) // これは必ず一番最初に呼ぶ

                const contentType = req.headers["content-type"].split(";")[0] as ContentTypesUnion
                if (facts.acceptedContentTypes.includes(contentType) !== true) {
                    throw new WebApiRuntimeError(new InvalidContentTypeErrorSpec())
                }

                if (facts.authenticationRequired) {
                    // ユーザー認証をここで行う
                    const authUser = await authenticate_user(facts, req.body, req.cookies)
                    if (authUser) {
                        // activeなユーザーにする
                        await this.usersRepository.activate(authUser)
                        await this.usersRepository.updateLastActivityDate(authUser, new Date())
                    }
                    params["authUser"] = authUser
                }

                // IPアドレス等を使ってアクセス制限をする場合はここで行う
                const ipAddress = req.headers["x-real-ip"]
                params["ipAddress"] = ipAddress

                req.body = body
                const data = await handler(req, res, params)
                if (typeof data !== "object") {
                    throw new Error("handlerはオブジェクトを返す必要があります")
                }
                res.write(Buffer.from(JSON.stringify(data)))
            } catch (error) {
                if (error instanceof Error) {
                    if (error instanceof WebApiRuntimeError) {
                        res.write(
                            Buffer.from(
                                JSON.stringify({
                                    ok: false,
                                    error_code: error.code,
                                    description: error.description,
                                    argument: error.argument,
                                    hint: error.hint,
                                    additional_message: error.additional_message,
                                    stack: null,
                                })
                            )
                        )
                    } else {
                        res.write(
                            Buffer.from(
                                JSON.stringify({
                                    ok: false,
                                    error_code: "unexpected_error",
                                    description: [error.toString()],
                                    stack: error.stack?.split("\n"),
                                })
                            )
                        )
                    }
                } else {
                    res.write(
                        Buffer.from(
                            JSON.stringify({
                                ok: false,
                                error_code: "unexpected_error",
                                description: ["unknown_error"],
                            })
                        )
                    )
                }
            }
            res.end()
        })
    }
    register(module: any) {
        module.default(this)
        return this
    }
    listen(port: number) {
        this.server.listen(port)
    }
}
