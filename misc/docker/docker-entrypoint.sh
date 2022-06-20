#!/bin/sh

set +u

# db
ENV_FILE=/data/www/codefever-community/env.yaml
DB_HOST=${DB_HOST:-"db"}
DB_PORT=${DB_PORT:-"3306"}
DB_USER=${DB_USER:-"root"}
DB_PASS=${DB_PASS:-"123456"}
DB_NAME=${DB_NAME:-"codefever_community"}

sed -i "s/host: localhost/host: ${DB_HOST}/" ${ENV_FILE}
sed -i "s/port: 3306/port: ${DB_PORT}/" ${ENV_FILE}
sed -i "s/username: root/username: ${DB_USER}/" ${ENV_FILE}
sed -i "s/password: 123456/password: ${DB_PASS}/" ${ENV_FILE}
sed -i "s/db: codefever_community/db: ${DB_NAME}/" ${ENV_FILE}

sleep 10

# init db
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "use ${DB_NAME}"; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e"set global sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';";
    cd /data/www/codefever-community/misc/
    sh ./create_db.sh
fi

# git-cli
sed -i 's!git: /usr/local/git/bin/git!git: /usr/bin/git!' /data/www/codefever-community/env.yaml
sed -i 's!shell: /usr/local/git/bin/git-shell!shell: /usr/bin/git-shell!' /data/www/codefever-community/env.yaml
sed -i 's!http: /usr/local/git/libexec/git-core/git-http-backend!http: /usr/lib/git-core/git-http-backend!' /data/www/codefever-community/env.yaml

chmod -R 0777 /data/www/codefever-community/git-storage
chmod -R 0777 /data/www/codefever-community/application/logs
