FROM node:18

WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate --schema prisma/mysql/schema.prisma

RUN chmod +x ./start.sh
ENV NODE_ENV=production
CMD ["./start.sh"]