FROM node:18

RUN apt update && \
    apt install -y ffmpeg libvips-dev

WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate --schema prisma/mysql/schema.prisma

RUN chmod +x ./start.sh
ENV NODE_ENV=production
CMD ["./start.sh"]