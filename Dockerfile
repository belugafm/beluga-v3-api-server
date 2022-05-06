FROM node:18

RUN apt update && \
    apt install -y \
    ffmpeg \
    libvips-dev \
    libheif-examples \
    libheif-dev

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .
RUN npx prisma generate --schema prisma/mysql/schema.prisma

RUN chmod +x ./start.sh
ENV NODE_ENV=production
CMD ["./start.sh"]