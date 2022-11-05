import { InvalidContentTypeErrorSpec, WebApiRuntimeError } from "../api/error"
import { Request, Response, read_body } from "./turbo"

import { UserAuthenticator } from "../authentication/user"
import { ContentTypesUnion } from "../api/facts/content_type"
import { IUserCommandRepository } from "../../domain/repository/command/User"
import { MethodFacts } from "../api/define"
import Router from "find-my-way"
import { UserEntity } from "../../domain/entity/User"
import config from "../../config/app"
import qs from "qs"
import turbo from "turbo-http"
import { ApplicationAuthenticator } from "../authentication/application"
import { ApplicationEntity } from "../../domain/entity/Application"
import { MethodIdentifiers } from "../api/identifier"

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

const InvalidAuthRoute = (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.setStatusCode(403)
    res.write(
        Buffer.from(
            JSON.stringify({
                ok: false,
                error: "invalid_auth",
            })
        )
    )
    res.end()
}

declare module "find-my-way" {
    type Handler = (
        req: Request,
        res: Response,
        params: { ipAddress: string; authUser: UserEntity | null; authApp: ApplicationEntity | null },
        store?: any
    ) => object | string
    type HTTPMethod = "GET" | "POST" | "OPTIONS"
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

const versionPath = "/api/v1/"

type Options = {}

export class TurboServer {
    router: Router.Instance
    server: turbo.Server
    userCommandRepository: IUserCommandRepository
    userAuthenticator: UserAuthenticator
    appAuthenticator: ApplicationAuthenticator
    constructor(
        opt: Router.Config,
        userCommandRepository: IUserCommandRepository,
        userAuthenticator: UserAuthenticator,
        appAuthenticator: ApplicationAuthenticator
    ) {
        if (opt.defaultRoute == null) {
            opt.defaultRoute = DefaultRoute
        }
        this.userCommandRepository = userCommandRepository
        this.userAuthenticator = userAuthenticator
        this.appAuthenticator = appAuthenticator
        this.router = Router(opt)
        this.server = turbo.createServer(async (_req, _res) => {
            // アクセスがあるたびここを通る
            const req = new Request(_req)
            const res = new Response(_res)
            const { host } = req.headers
            if (host == null) {
                console.log(req.headers)
                return AccessDeniedRoute(req, res)
            }
            const domain = host.split(":")[0]
            if (domain !== config.server.domain) {
                return AccessDeniedRoute(req, res)
            }
            return this.router.lookup(req, res)
        })
    }
    get(facts: MethodFacts, handler: Router.Handler, options: Options = {}) {
        if (facts.httpMethod !== "GET") {
            throw new Error("POSTリクエストが要求されているエンドポイントをGETに登録することはできません")
        }
        const requestBasePath = versionPath + facts.url
        this.router.get(requestBasePath, async (req, res, params) => {
            res.setHeader("Content-Type", ContentType.JSON)
            try {
                const query = qs.parse(req.url.replace(/^.+\?/, ""), {
                    decoder: decodeURIComponent,
                })
                req.query = query

                if (facts.userAuthenticationRequired) {
                    // ユーザー認証をここで行う
                    const authUser = await this.userAuthenticator.authenticate({
                        facts: facts,
                        // GETリクエストの場合requestBaseUrlは?以降を削除したもの
                        requestBaseUrl: config.server.get_base_url() + requestBasePath,
                        headers: req.headers,
                        cookies: req.cookies || {},
                        body: query,
                        httpMethod: "GET",
                    })
                    if (authUser == null) {
                        return InvalidAuthRoute(req, res)
                    }
                    params["authUser"] = authUser
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
            throw new Error("GETリクエストが要求されているエンドポイントをPOSTに登録することはできません")
        }
        const requestBasePath = versionPath + facts.url
        this.router.post(requestBasePath, async (req, res, params) => {
            res.setHeader("Content-Type", ContentType.JSON)
            res.setStatusCode(200)
            try {
                const body = await read_body(req) // これは必ず一番最初に呼ぶ

                const contentType = req.headers["content-type"].split(";")[0] as ContentTypesUnion
                if (facts.acceptedContentTypes.includes(contentType) !== true) {
                    throw new WebApiRuntimeError(new InvalidContentTypeErrorSpec())
                }

                if (facts.url == MethodIdentifiers.GenerateRequestToken) {
                    // アプリケーションの認証
                    const authApp = await this.appAuthenticator.authenticate({
                        requestBaseUrl: config.server.get_base_url() + requestBasePath,
                        headers: req.headers,
                        body: body,
                    })
                    if (authApp == null) {
                        return InvalidAuthRoute(req, res)
                    }
                    params["authApp"] = authApp
                } else if (facts.url == MethodIdentifiers.GenerateAccessToken) {
                    // リクエストトークンによるユーザー認証
                    const [authApp, authUser] = await this.userAuthenticator.authenticateByRequestToken({
                        facts: facts,
                        requestBaseUrl: config.server.get_base_url() + requestBasePath,
                        headers: req.headers,
                        cookies: req.cookies || {},
                        body: body,
                    })
                    if (authApp == null) {
                        return InvalidAuthRoute(req, res)
                    }
                    if (authUser == null) {
                        return InvalidAuthRoute(req, res)
                    }
                    // activeなユーザーにする
                    await this.userCommandRepository.activate(authUser)
                    await this.userCommandRepository.updateLastActivityDate(authUser, new Date())
                    params["authUser"] = authUser
                    params["authApp"] = authApp
                } else {
                    if (facts.userAuthenticationRequired) {
                        // アクセストークンもしくはCookieによるユーザー認証を行う
                        const authUser = await this.userAuthenticator.authenticate({
                            facts: facts,
                            requestBaseUrl: config.server.get_base_url() + requestBasePath,
                            headers: req.headers,
                            cookies: req.cookies || {},
                            body: body,
                            httpMethod: "POST",
                        })
                        if (authUser == null) {
                            return InvalidAuthRoute(req, res)
                        }
                        // activeなユーザーにする
                        await this.userCommandRepository.activate(authUser)
                        await this.userCommandRepository.updateLastActivityDate(authUser, new Date())
                        params["authUser"] = authUser
                    }
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
                console.error(error)
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
