#!/bin/bash
if [ $UID -ne 0 ]; then
    echo 'run as root please'
    exit 1
fi

echo 'start installation...'

useradd -r www
useradd -rm git

echo 'user www created!'

sudo -u git ssh-keygen -A

echo 'ssh for user git set!'

cp nginx.conf-template /usr/local/nginx/conf/nginx.conf

echo 'nginx configuration file cpoied!'

cp php.ini-template /usr/local/php/etc/php.ini
cp php-fpm.conf-template /usr/local/php/etc/php-fpm.conf
cp www.conf-template /usr/local/php/etc/php-fpm.d/www.conf

echo 'php (php.ini & php-fpm) configuration file cpoied!'

cp nginx-service-template /etc/init.d/nginx
cp php-fpm-service-template /etc/init.d/php-fpm
cp codefever-service-template /etc/init.d/codefever

echo 'services installed!'

service codefever start
service php-fpm start
service nginx start

echo 'services started!'

echo 'Done!'
