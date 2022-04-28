FROM node:18
ARG NODE_ENV=production

WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate --schema mysql.prisma

RUN chmod +x ./start.sh
ENV NODE_ENV=${NODE_ENV}
CMD ["./start.sh"]