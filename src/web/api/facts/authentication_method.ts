export const AuthenticationMethods = {
    Cookie: "Cookie",
    OAuth: "OAuth",
} as const

export type AuthenticationMethodsLiteralUnion = keyof typeof AuthenticationMethods
