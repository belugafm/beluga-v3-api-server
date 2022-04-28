FROM node:17
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY . .
RUN npm install
RUN chmod +x ./start.sh
CMD ["./start.sh"]