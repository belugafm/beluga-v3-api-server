const config: {
    server: {
        domain: string
        port: number
        https: boolean
        get_base_url: () => string
    }
    terms_of_service: {
        version: string
    }
    trust_levels: { label: string; level: number }[]
    admin: {
        name: string
        password: string
    }
    user_registration: {
        limit: number
        delete_inactive_user_after: number
        reclassify_active_as_dormant_after: number
    }
    user_login_credential: {
        password: {
            salt_rounds: number
            min_length: number
        }
    }
    user_login_session: {
        lifetime: number
    }
    user: {
        name: {
            min_length: number
            max_length: number
            regexp: object
        }
        display_name: {
            min_length: number
            max_length: number
        }
        description: {
            min_length: number
            max_length: number
        }
    }
    reserved_user_names: string[]
    channel_group: {
        name: {
            min_length: number
            max_length: number
        }
        description: {
            min_length: number
            max_length: number
        }
        create_limit_per_day: number
        min_trust_level_required_to_create: number
    }
    channel: {
        name: {
            min_length: number
            max_length: number
        }
        description: {
            min_length: number
            max_length: number
        }
        create_limit_per_day: number
        min_trust_level_required_to_create: number
    }
    status: {
        no_editing_after: number
        text: {
            min_length: number
            max_length: number
        }
        like: {
            max_count: number
        }
    }
    in_memory_cache: {
        enabled: boolean
        cache_limit: number
        default_expire_seconds: number
    }
    blocks: {
        enabled: boolean
    }
} = {
    server: {
        domain: "localhost.beluga.fm",
        port: 8080,
        https: false,
        get_base_url: () => {
            if (config.server.https) {
                return `https://${config.server.domain}`
            } else {
                return `http://${config.server.domain}`
            }
        },
    },
    terms_of_service: {
        version: "dc96fc180a405bf5c2d1631ab69444e71bbbd0ac",
    },
    trust_levels: [
        { label: "不審ユーザー", level: 0 },
        { label: "ビジター", level: 1 },
        { label: "認証ユーザー", level: 2 },
        { label: "モデレーター", level: 3 },
        { label: "管理者", level: 4 },
    ],
    admin: {
        name: "admin",

        // 以下は必ず変更する
        password: "password",
    },
    user_registration: {
        // 同じIPアドレスでの登録はこの秒数の間隔より短く行えないようになる
        limit: 86400,

        // 登録後にサイトを利用しないままこの秒数が経過したアカウントは削除される
        delete_inactive_user_after: 86400 * 3,

        // サイトを利用していたユーザーが最後に利用してから
        // この秒数経過した場合は休眠アカウントにする
        reclassify_active_as_dormant_after: 86400 * 365 * 3,
    },
    user_login_credential: {
        password: {
            salt_rounds: 10,
            min_length: 8,
        },
    },
    user_login_session: {
        // セッションの期限（秒）
        lifetime: 86400 * 14,
    },
    user: {
        name: {
            min_length: 1,
            max_length: 32,
            regexp: new RegExp(/^[a-zA-Z0-9_]+$/),
        },
        display_name: {
            min_length: 1,
            max_length: 32,
        },
        description: {
            min_length: 1,
            max_length: 1000,
        },
    },
    reserved_user_names: ["admin"],
    channel_group: {
        name: {
            min_length: 1,
            max_length: 32,
        },
        description: {
            min_length: 0,
            max_length: 3000,
        },
        // 1日あたりの新規作成可能なチャンネルグループ数
        create_limit_per_day: 50,

        // 作成に必要な最低Trust Level
        min_trust_level_required_to_create: 2,
    },
    channel: {
        name: {
            min_length: 1,
            max_length: 32,
        },
        description: {
            min_length: 0,
            max_length: 3000,
        },
        // 1日あたりの新規作成可能なチャンネル数
        create_limit_per_day: 50,

        // 作成に必要な最低Trust Level
        min_trust_level_required_to_create: 2,
    },
    status: {
        // 投稿を編集可能な期間（秒）
        no_editing_after: 60 * 5,
        text: {
            min_length: 0,
            max_length: 3000,
        },
        like: {
            max_count: 10,
        },
    },
    in_memory_cache: {
        enabled: true,
        cache_limit: 1000,
        default_expire_seconds: 600,
    },
    blocks: {
        enabled: false,
    },
}

export default config
