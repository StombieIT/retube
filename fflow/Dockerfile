FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn build

CMD ["yarn", "start:prod"]
