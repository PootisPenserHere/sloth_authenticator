FROM postgres:12-alpine
LABEL maintainer = "Jose Pablo Domingo Aramburo Sanchez <josepablo.aramburo@laziness.rocks>"

# So that the timezone can be sent with the TZ environment
RUN apk add --no-cache tzdata

# Starting scripts
ADD . /docker-entrypoint-initdb.d
