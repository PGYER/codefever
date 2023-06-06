#!/bin/bash
setsid ./misc/initailize_container.sh &

exec /usr/sbin/init
