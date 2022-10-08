echo alias docker-compose="'"'docker run --rm \
 -v /var/run/docker.sock:/var/run/docker.sock \
 -v "$PWD:/rootfs/$PWD" \
 -w="/rootfs/$PWD" \
 docker/compose:1.29.2'"'" >> ~/.bashrc
source ~/.bashrc
