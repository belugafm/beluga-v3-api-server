// import debug, { facts } from "../api/methods/debug"

// import { TurboServer } from "../turbo"
// import config from "../../config/app"

// export default (server: TurboServer) => {
//     server.get(facts, async (req, res, params) => {
//         const [user, loginSession] = await debug(
//             {
//                 password: "hogehoge",
//             },
//             null
//         )
//         if (loginSession) {
//             res.setCookie("session_id", loginSession.sessionId, {
//                 expires: loginSession.expireDate,
//                 domain: config.server.domain,
//                 path: "/",
//                 httpOnly: true,
//                 secure: config.server.https,
//             })
//         }
//         return {
//             ok: true,
//             user: user?.dict(),
//             loginSession: loginSession?.dict(),
//         }
//     })
// }
