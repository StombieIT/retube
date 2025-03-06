FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

CMD ["yarn", "start:prod"]
