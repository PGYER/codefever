#!/bin/bash

if [ -f ./install.lock ]; then
    exit 0
fi

echo 'await system initializing...'
sleep 30

echo '> Start post initialization...'

if [ ! -f ./env/env.yaml ]; then
    cp ./env.template.yaml ./env/env.yaml
fi

if [ ! -f ./env/config.yaml ]; then
    cp ./config.template.yaml ./env/config.yaml
fi

chmod 0777 ./env/config.yaml ./env/env.yaml ./env.yaml ./config.yaml
chmod -R 0777 ./git-storage

chmod -R 0777 ./application/logs
chown -R git:git ./application/logs

chmod -R 0777 ./file-storage
chown -R git:git ./file-storage

chown -R git:git ./misc

chown -R mysql:mysql /var/lib/mysql

TARGET_CRONJOB=`crontab -u git -l 2>/dev/null | grep 'codefever_schedule.sh' | wc -l`
if [ $TARGET_CRONJOB -eq 0 ]; then
    crontab -u git -l 2>/dev/null >  /tmp/cronjob.temp
    echo "* * * * * sh /data/www/codefever-community/application/backend/codefever_schedule.sh" >> /tmp/cronjob.temp
    crontab -u git /tmp/cronjob.temp
    rm -f /tmp/cronjob.temp
fi

echo 'Generateing public key for ssh ...'
echo -n "y" | sudo -u git ssh-keygen -N ""  -f /home/git/.ssh/id_rsa
service sshd restart

# start services
service codefever start
service php-fpm start
service nginx start
service crond start
service sendmail start

# enable all services
chkconfig mariadb on
chkconfig sendmail on
chkconfig nginx on
chkconfig php-fpm on
chkconfig codefever on
chkconfig crond on

# init database
echo 'Start Database Initialization...'
sudo -u mysql mariadb-install-db

service mariadb start
echo -e "\ny\ny\n123456\n123456\ny\ny\ny\ny\n" | mariadb-secure-installation

chmod +x ./misc/create_db.sh
cd ./misc/ && ./create_db.sh && cd -

echo '1' > ./install.lock
