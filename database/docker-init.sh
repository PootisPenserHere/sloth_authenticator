#!/usr/bin/env bash

cd /docker-entrypoint-initdb.d/

find "$PWD" -type f -name "*.sql" | sort | \
while read l; do
    # TODO parametrize the database credentials
    psql -d auth_service -U sloth -f "$d/$l";
done
