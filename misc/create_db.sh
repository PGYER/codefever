#!/bin/bash
if [ $UID -ne 0 ]; then
    echo 'run as root please'
    exit 1
fi

DB_HOST = `cat ../env.yaml | grep host | awk -F: '{ print $2 }'` | sed 's/^\s*//'
DB_PORT = `cat ../env.yaml | grep port | awk -F: '{ print $2 }'` | sed 's/^\s*//'
DB_USER = `cat ../env.yaml | grep username | awk -F: '{ print $2 }'` | sed 's/^\s*//'
DB_PASS = `cat ../env.yaml | grep password | awk -F: '{ print $2 }'` | sed 's/^\s*//'
DB_NAME = `cat ../env.yaml | grep db | awk -F: '{ print $2 }'` | sed 's/^\s*//'

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p "$DB_PASS" -e "create database $DB_NAME";

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p "$DB_PASS" -D"$DB_NAM" -e "show tables;";

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p "$DB_PASS" -D"$DB_NAM" -e "source db.sql";
