#!/bin/bash
if [ $UID -ne 0 ]; then
    echo 'run as root please'
    exit 1
fi

echo 'start installation...'

useradd -r www
useradd -rm git

echo 'user www created!'

echo 'Generateing public key for ssh: (Just Press Enter Key!)'
sudo -u git ssh-keygen -f /home/git/.ssh/id_rsa

echo 'ssh for user git set!'

cp nginx.conf-template /usr/local/nginx/conf/nginx.conf

echo 'nginx configuration file copied!'

cp php.ini-template /usr/local/php/etc/php.ini
cp php-fpm.conf-template /usr/local/php/etc/php-fpm.conf
cp www.conf-template /usr/local/php/etc/php-fpm.d/www.conf

echo 'php (php.ini & php-fpm) configuration file cpoied!'

cp nginx-service-template /etc/init.d/nginx
cp php-fpm-service-template /etc/init.d/php-fpm
cp codefever-service-template /etc/init.d/codefever

echo 'services installed!'

cp ../config.template.yaml ../config.yaml
cp ../env.template.yaml ../env.yaml

chmod 0777 ../config.yaml ../env.yaml

echo 'env files generated!'

mkdir ../application/logs
chown -R git:git ../application/logs

chmod -R 0777 ../git-storage

mkdir ../file-storage
chown -R git:git ../file-storage
chown -R git:git ../misc

echo 'Enssential directory created!'

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

echo 'Services Started!'

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
echo '1. You shuold edit file </data/www/codefever-community/env.yaml: mysql/*> to finish mysql settings.'
echo '2. You shuold edit file </data/www/codefever-community/env.yaml: session/*> to finish cookie settings.'
echo '3. You shuold edit file </data/www/codefever-community/env.yaml: gateway/token> to finish git gateway security settings.'
echo '4. Run sh ./create_db.sh after change env.yaml.'
echo '5. Run sh ./remove_test_data.sh if you DO NOT need to run unit test.'
