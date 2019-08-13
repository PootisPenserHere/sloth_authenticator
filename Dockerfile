FROM node:10.16-alpine
LABEL maintainer = "Jose Pablo Domingo Aramburo Sanchez <josepablo.aramburo@laziness.rocks>"

COPY . /usr/src/app
WORKDIR /usr/src/app

# So that the timezone can be sent with the TZ environment
RUN apk add --no-cache tzdata

RUN yarn install && \
    yarn cache clean

USER node

#CMD ["yarn", "dev"]
CMD ["yarn", "start"]
