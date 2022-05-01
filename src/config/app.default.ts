const config: {
    server: {
        domain: string
        port: number
        https: boolean
        get_base_url: () => string
    }
    private_api: {
        allowed_ip_addresses: string[]
    }
    terms_of_service: {
        version: string
    }
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
            max_length: number
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
        location: {
            min_length: number
            max_length: number
        }
        url: {
            min_length: number
            max_length: number
        }
    }
    reserved_user_names: string[]
    channel_group: {
        name: {
            min_length: number
            max_length: number
            regexp: object
        }
        unique_name: {
            min_length: number
            max_length: number
            default_length: number
            regexp: object
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
            regexp: object
        }
        unique_name: {
            min_length: number
            max_length: number
            default_length: number
            regexp: object
        }
        description: {
            min_length: number
            max_length: number
        }
        create_limit_per_day: number
        min_trust_level_required_to_create: number
    }
    message: {
        no_editing_after: number
        wait_until: number
        text: {
            min_length: number
            max_length: number
        }
        text_style: {
            format: {
                is_bold: number
                is_italic: number
                is_strikethrough: number
                is_underline: number
                is_code: number
                is_subscript: number
                is_superscript: number
            }
        }
        like: {
            max_count: number
        }
    }
    query_cache: {
        enabled: boolean
        cache_limit: number
        default_expire_seconds: number
    }
    blocks: {
        enabled: boolean
    }
    twitter: {
        api_key: string
        api_key_secret: string
        callback_url: string
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
    private_api: {
        allowed_ip_addresses: ["127.0.0.1"],
    },
    terms_of_service: {
        version: "dc96fc180a405bf5c2d1631ab69444e71bbbd0ac",
    },
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
            max_length: 72, // bcryptは72文字までが有効らしい
        },
    },
    user_login_session: {
        // セッションの期限（秒）
        lifetime: 86400 * 14,
    },
    user: {
        name: {
            min_length: 1,
            max_length: 30,
            regexp: new RegExp(/^[a-zA-Z0-9_]+$/),
        },
        display_name: {
            min_length: 1,
            max_length: 30,
        },
        description: {
            min_length: 1,
            max_length: 1000,
        },
        location: {
            min_length: 1,
            max_length: 30,
        },
        url: {
            min_length: 1,
            max_length: 200,
        },
    },
    reserved_user_names: ["admin"],
    channel_group: {
        name: {
            min_length: 1,
            max_length: 32,
            regexp: new RegExp(/^\S+$/),
        },
        unique_name: {
            min_length: 1,
            max_length: 32,
            default_length: 12,
            regexp: new RegExp(/^[a-zA-Z0-9]+$/),
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
            regexp: new RegExp(/^\S+$/),
        },
        unique_name: {
            min_length: 1,
            max_length: 32,
            default_length: 12,
            regexp: new RegExp(/^[a-zA-Z0-9]+$/),
        },
        description: {
            min_length: 0,
            max_length: 3000,
        },
        // 1日あたりの新規作成可能なチャンネル数
        create_limit_per_day: 100,

        // 作成に必要な最低Trust Level
        min_trust_level_required_to_create: 2,
    },
    message: {
        // 投稿を編集可能な期間（秒）
        no_editing_after: 86400 * 30,
        // 次に投稿するまでに待たなければならない時間（ミリ秒）
        wait_until: 500,
        text: {
            min_length: 1,
            max_length: 3000,
        },
        text_style: {
            format: {
                is_bold: 1,
                is_italic: 1 << 1,
                is_strikethrough: 1 << 2,
                is_underline: 1 << 3,
                is_code: 1 << 4,
                is_subscript: 1 << 5,
                is_superscript: 1 << 6,
            },
        },
        like: {
            max_count: 10,
        },
    },
    query_cache: {
        enabled: true,
        cache_limit: 1000,
        default_expire_seconds: 600,
    },
    blocks: {
        enabled: false,
    },
    twitter: {
        api_key: "YOUR_API_KEY",
        api_key_secret: "YOUR_API_KEY_SCRET",
        callback_url: "CALLBACK_URL",
    },
}

export default config
