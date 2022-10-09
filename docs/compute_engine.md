echo alias docker-compose="'"'docker run --rm -it \
 -v /var/run/docker.sock:/var/run/docker.sock \
 -v "$PWD:$PWD" \
 -w="$PWD" \
 docker/compose:1.29.2'"'" >> ~/.bashrc
source ~/.bashrc

https://cloud.google.com/compute/docs/disks/add-persistent-disk?hl=ja#formatting
