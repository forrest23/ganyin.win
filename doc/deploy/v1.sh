#!/bin/bash

# Copy this script to $HOME and run it

path=/srv/www/todo
tmp=/srv/www/tmp

echo 'Cloning repo from github...'
git clone https://github.com/forrest23/ganyin.win.git $tmp
echo '...done!'
echo ''

echo 'Removing development files...'
sudo rm $tmp/README.md
sudo rm -fr $tmp/doc
echo '...done!'
echo ''

echo 'Installing dependency modules...'
cd $tmp
sudo npm install -l
echo '...done!'
echo ''

echo 'Backing up old version...'
mv $path $path`date +"%Y%m%d%H%M%S"`
echo '...done!'
echo ''

echo 'Stopping monit...'
# sudo /etc/init.d/monit stop
sudo monit stop todo
echo '...done!'
echo ''

echo 'Stopping nginx...'
sudo nginx -s stop
echo '...done!'
echo ''

echo 'Stopping iceberg server...'
sudo stop todo
echo '...done!'
echo ''

echo 'Switch to latest version...'
mv $tmp $path
echo '...done!'
echo ''

echo 'Starting iceberg server...'
sudo start todo
echo '...done!'
echo ''

echo 'Starting nginx...'
sudo nginx
echo '...done!'
echo ''

echo 'Starting monit...'
# sudo /etc/init.d/monit start
sudo monit start todo
echo '...done!'
