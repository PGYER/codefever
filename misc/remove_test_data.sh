#!/bin/bash
if [ $UID -ne 0 ]; then
    echo 'run as root please'
    exit 1
fi

DB_HOST=`cat ../env.yaml | grep host: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_PORT=`cat ../env.yaml | grep port: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_USER=`cat ../env.yaml | grep username: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_PASS=`cat ../env.yaml | grep password: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_NAME=`cat ../env.yaml | grep db: | awk -F: '{ print $2 }' | sed 's/^\s*//'`


mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" -e"DELETE FROM cc_users WHERE u_key = '26c20714af8bc20aa85be657a5170e71';";
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" -e"DELETE FROM cc_users WHERE u_key = 'f4a9c54adef17599d4f709a1167f0fcd';";

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" -e"DELETE FROM cc_ssh_keys WHERE u_key = 'f4a9c54adef17599d4f709a1167f0fcd';";

echo 'Test User Data Removed!'

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" -e"DELETE FROM cc_repositories WHERE r_key = '2f941aef39bc8a048da55dd28c678655';";

echo 'Test Repository Data Removed!'

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" -e"DELETE FROM cc_groups WHERE g_key = 'e6508c1a66e86f697c96bdffb30c1ae3';";

echo 'Test Group Data Removed!'

rm -rf ../git-storage/7b56eed88bda864c6e5ae1540549f8ab

echo 'Test Repository Removed!'

echo 'Done!'
echo 'All Test Data Removed!'
