import { MethodFacts } from "./api/define"
import { UserEntity } from "../domain/entity/User"

// export const invalidate_last_login_session = async (cookies: any) => {
//     const [_, session] = await authenticate_user_with_cookie(cookies)
//     if (session) {
//         await invalidate({ session_id: session._id })
//     }
// }

// export const authenticate_user_with_cookie = async (cookies: any) => {
//     cookies = cookies || {}
//     const user_id_str = cookies["user_id"]
//     const session_id_str = cookies["session_id"]
//     const session_token = cookies["session_token"]
//     if (user_id_str && session_id_str && session_token) {
//         return await authenticate_login_session({
//             user_id: new mongoose.Types.ObjectId(user_id_str),
//             session_id: new mongoose.Types.ObjectId(session_id_str),
//             session_token: session_token,
//         })
//     }
//     return [null, null]
// }

export const authenticate_user = async (
    facts: MethodFacts,
    query: any,
    cookies: any
): Promise<UserEntity | null> => {
    query = query || {}
    cookies = cookies || {}
    const {
        access_token,
        access_token_scret,
        oauth_consumer_key,
        oauth_consumer_secret,
        oauth_bearer_token,
    } = query

    if (facts.acceptedAuthenticationMethods.includes("OAuth")) {
        if (oauth_bearer_token && oauth_consumer_key && oauth_consumer_secret) {
            // OAuth認証
        }
    }
    if (facts.acceptedAuthenticationMethods.includes("AccessToken")) {
        if (access_token && access_token_scret) {
            // アクセストークンによる認証
        }
    }
    if (facts.acceptedAuthenticationMethods.includes("Cookie")) {
        // Cookieを使ったログインセッション
        // const [user, _] = await authenticate_user_with_cookie(cookies)
        // return user
    }
    return null
}
