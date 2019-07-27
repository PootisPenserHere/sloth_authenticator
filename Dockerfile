FROM node:10.16-alpine
LABEL maintainer = "Jose Pablo Domingo Aramburo Sanchez <jose.domingo@coppel.com>"

COPY . /usr/src/app
WORKDIR /usr/src/app

# So that the timezone can be sent with the TZ environment
RUN apk add --no-cache tzdata

RUN yarn install && \
    yarn global add nodemon@1.18.11 && \
    yarn cache clean

CMD ["nodemon", "index.js"]
