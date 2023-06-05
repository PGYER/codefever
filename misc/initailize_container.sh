#!/bin/bash
echo '> Start post initialization...'

cp ../config.template.yaml ../config.yaml
cp ../env.template.yaml ../env.yaml
chmod 0777 ../config.yaml ../env.yaml
chmod -R 0777 ../git-storage

chown -R git:git ../application/logs
chown -R git:git ../file-storage
chown -R git:git ../misc

TARGET_CRONJOB=`crontab -u git -l 2>/dev/null | grep 'codefever_schedule.sh' | wc -l`
if [ $TARGET_CRONJOB -eq 0 ]; then
    crontab -u git -l 2>/dev/null >  /tmp/cronjob.temp
    echo "* * * * * sh /data/www/codefever-community/application/backend/codefever_schedule.sh" >> /tmp/cronjob.temp
    crontab -u git /tmp/cronjob.temp
    rm -f /tmp/cronjob.temp
fi

echo 'Generateing public key for ssh: (Just Press Enter Key!)'
sudo -u git ssh-keygen -f /home/git/.ssh/id_rsa
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

# set mysql root password 
echo 'Start Database Initialization...'
./misc/create_db.sh

