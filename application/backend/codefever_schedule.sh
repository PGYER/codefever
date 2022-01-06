#/bin/bash

filepath=$(cd "$(dirname "$0")"; pwd)
filepath=`dirname $filepath`
filepath=`dirname $filepath`
filepath="$filepath/www/index.php"

RUNNING_STATUS=$(ps aux | grep 'codefever_schedule' | grep -v 'grep' | grep -v 'sh' | wc -l)
if [ $RUNNING_STATUS -lt 1 ]
then
    nohup /usr/local/php7/bin/php $filepath backend/codefever_schedule run > /dev/null &
fi
