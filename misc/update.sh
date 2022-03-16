#!/bin/bash
if [ $UID -ne 0 ]; then
    echo 'run as root please'
    exit 1
fi

echo 'start update...'

service codefever stop
service php-fpm stop
service nginx stop

yum install -y crontabs sendmail mailx
service crond stop

echo 'service stopped!'

cp nginx.conf-template /usr/local/nginx/conf/nginx.conf

echo 'nginx configuration file copied!'

cp php.ini-template /usr/local/php/etc/php.ini
cp php-fpm.conf-template /usr/local/php/etc/php-fpm.conf
cp www.conf-template /usr/local/php/etc/php-fpm.d/www.conf

echo 'php (php.ini & php-fpm) configuration file cpoied!'

cp nginx-service-template /etc/init.d/nginx
cp php-fpm-service-template /etc/init.d/php-fpm
cp codefever-service-template /etc/init.d/codefever

echo 'services updated!'

echo 'Loading composer libraries: (Just Press Enter Key!)'

cd ../application/libraries/composerlib/
/usr/local/php/bin/php ./composer.phar install
cd -

echo 'Composer libraries loaded!'

service codefever start
service php-fpm start
service nginx start
service crond start
service sendmail start

chkconfig crond on
chkconfig sendmail on

echo 'services started!'

DB_HOST=`cat ../env.yaml | grep host: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_PORT=`cat ../env.yaml | grep port: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_USER=`cat ../env.yaml | grep username: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_PASS=`cat ../env.yaml | grep password: | awk -F: '{ print $2 }' | sed 's/^\s*//'`
DB_NAME=`cat ../env.yaml | grep db: | awk -F: '{ print $2 }' | sed 's/^\s*//'`

# update db to version 20220215
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" -e"source db_update_20220215.sql";

echo 'database updated!'

TARGET_CRONJOB=`crontab -u git -l 2>/dev/null | grep 'codefever_schedule.sh' | wc -l`
if [ $TARGET_CRONJOB -eq 0 ]; then
    crontab -u git -l 2>/dev/null >  /tmp/cronjob.temp
    echo "* * * * * sh /data/www/codefever-community/application/backend/codefever_schedule.sh" >> /tmp/cronjob.temp
    crontab -u git /tmp/cronjob.temp
    rm -f /tmp/cronjob.temp
fi

echo 'Cronjob Registerd!'

echo 'Done!'

echo -e "\n\n\n"

echo '=== IMPORTANT NOTICE ==='
echo '1. CodeFever Comminuty Upgrated.'
echo 'have fun!'
