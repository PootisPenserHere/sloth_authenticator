FROM node:10.16-alpine
LABEL maintainer = "Jose Pablo Domingo Aramburo Sanchez <josepablo.aramburo@laziness.rocks>"

COPY . /usr/src/app
WORKDIR /usr/src/app

# So that the timezone can be sent with the TZ environment
RUN apk add --no-cache tzdata

RUN yarn install --production=true && \
    yarn global add nodemon@1.18.11 && \
    yarn cache clean

CMD ["nodemon", "--ignore", "logs/", "index.js"]
