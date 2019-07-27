#!/usr/bin/env bash

cd /docker-entrypoint-initdb.d/

find "$PWD" -type f -name "*.sql" | sort | \
while read l; do
    # The env variables are set by docker-compose and taken from the .env file
    psql -d $POSTGRES_DB -U $POSTGRES_USER -f "$d/$l";
done
