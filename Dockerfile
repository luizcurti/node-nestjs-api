FROM node:lts-alpine

RUN apk add --no-cache bash postgresql-client


RUN npm install -g @nestjs/cli

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install
COPY . .

USER node

CMD ["npm", "run", "start:dev"]
