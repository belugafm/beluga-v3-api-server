echo alias docker-compose="'"'docker run --rm -it \
 -v /var/run/docker.sock:/var/run/docker.sock \
 -v "$PWD:$PWD" \
 -w="$PWD" \
 docker/compose:1.29.2'"'" >> ~/.bashrc
source ~/.bashrc

e2-small
OS は Container Optimized OS
/var/lib/docker が肥大化するのでブートディスクは 50GB くらいにする

https://cloud.google.com/compute/docs/disks/add-persistent-disk?hl=ja#formatting

src/web/repositories.ts と src/config/app.ts を作る
docker build -t beluga-v3-api-server .
docker build -t beluga-v3-browser-client .
