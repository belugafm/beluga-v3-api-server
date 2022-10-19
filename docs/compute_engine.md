echo alias docker-compose="'"'docker run --rm -it \
 -v /var/run/docker.sock:/var/run/docker.sock \
 -v "$PWD:$PWD" \
 -w="$PWD" \
 docker/compose:1.29.2'"'" >> ~/.bashrc
source ~/.bashrc

e2-small
OS は Container Optimized OS
/var/lib/docker が肥大化するのでブートディスクは 20GB くらいにする

https://cloud.google.com/compute/docs/disks/add-persistent-disk?hl=ja#formatting

src/web/repositories.ts と src/config/app.ts と docker_compose/compute_engine/mysql/.env を作る
docker build -t beluga-v3-api-server .

クライアントをこのインスタンスで動かす場合（重くなるので非推奨）
cd desktop
config.ts を作る
docker build -t beluga-v3-browser-client .

ロードバランサ
バックエンドにインスタンスグループを指定
プロトコルは HTTP でいい
分散モードは使用率で最大使用率は 100%
CDN はオフ

Cloud Storage へのアクセス
https://cloud.google.com/docs/authentication/getting-started

サービスアカウントを作ってロールを Storage オブジェクト作成者にする
JSON でキーを保存しパスを.env の GOOGLE_APPLICATION_CREDENTIALS に書く

初回実行時は MySQL の初期化が終わってないので docker-compose up して初期化後 down して再度 up する
