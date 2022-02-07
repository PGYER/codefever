#!/bin/bash
if [ $UID -ne 0 ]; then
    echo 'run as root please'
    exit 1
fi

echo 'start update...'

service codefever stop
service php-fpm stop
service nginx stop

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

cp ../config.template.yaml ../config.yaml
cp ../env.template.yaml ../env.yaml

chmod 0777 ../config.yaml ../env.yaml

echo 'env files overwrote!'

echo 'Loading composer libraries: (Just Press Enter Key!)'

cd ../application/libraries/composerlib/
/usr/local/php/bin/php ./composer.phar install
cd -

echo 'Composer libraries loaded!'

service codefever start
service php-fpm start
service nginx start

echo 'services started!'

echo 'Done!'

echo -e "\n\n\n"

echo '=== IMPORTANT NOTICE ==='
echo '1. You shuold edit file </data/www/codefever-community/env.yaml: mysql/*> to finish mysql settings.'
echo '2. You shuold edit file </data/www/codefever-community/env.yaml: session/*> to finish cookie settings.'
echo '3. You shuold edit file </data/www/codefever-community/env.yaml: gateway/token> to finish git gateway security settings.'
echo 'have fun!'
