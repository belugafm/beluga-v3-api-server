```
npx prisma generate --schema prisma/mysql/schema.prisma
env DATABASE_URL=mysql://root:root@127.0.0.2:3306/test_database npx prisma migrate dev --name init --schema prisma/mysql/schema.prisma
```

docker_compose/mysql/docker/mysql/data
docker_compose/mysql/docker/mysql/sql
を作る

mkcert

```
sudo apt install libnss3-tools
mkcert -install
cd nginx
mkcert -key-file key.pem -cert-file cert.pem localhost.beluga.fm 127.0.0.1 localhost
```

```
cd nginx
mkcert localhost.beluga.fm 127.0.0.1
```

```
npm install
env DATABASE_URL=mysql://root:root@127.0.0.1:3306/test_database npx prisma migrate dev --name init --schema prisma/mysql/schema.prisma
env DATABASE_URL=mysql://root:root@127.0.0.1:3306/test_database GCLOUD_STORAGE_BUCKET=beluga-public npx ts-node src/run.prisma.ts
```

ローカル PC の IP アドレスを調べて nginx.conf に書く
wslを使っている場合はwslのubuntuのホストIPアドレスになる

```
ip addr show
```

Message.text の全文検索のパーサーに ngram を手動で設定する必要がある
WITH PARSER ngram
