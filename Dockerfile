FROM node:10.16-alpine
LABEL maintainer = "Jose Pablo Domingo Aramburo Sanchez <josepablo.aramburo@laziness.rocks>"

COPY . /usr/src/app
WORKDIR /usr/src/app

# So that the timezone can be sent with the TZ environment
RUN apk add --no-cache tzdata

RUN yarn install && \
    yarn cache clean

# Default user with lower privileges
USER node

HEALTHCHECK --interval=10s --timeout=2s --start-period=15s CMD node ./healthcheck.js

CMD ["node", "index.js"]
