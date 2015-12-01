#!/bin/bash

dbpresent=`PGPASSWORD=$DBPASSWORD psql -U $DBUSER -h $DBHOST -p $DBPORT -lqt | cut -d \| -f 1 | grep -w $DBNAME | wc -l`
if [ "$dbpresent" -ne 1 ]; then
    echo "Creating database $DBNAME."
    PGPASSWORD=$DBPASSWORD createdb -p $DBPORT -h $DBHOST -U $DBUSER $DBNAME
    result="$?"
    if [ result -ne 0 ]; then
        echo "Database creation failed $DBNAME."
        exit 1
    fi
else
    echo "Database already exists $DBNAME."
fi

node /src/server.js
