# Installation guide for Ubuntu 14+ (other systems might be similar)
- follow install-guide and install nodejs 6+: https://nodejs.org/en/download/package-manager/
- run 'apt-get install build-essentials'
- checkout repository in a directory of your choice
- run 'npm install' in that directory
- run the script './create_settings' it will create a file called ac-settings.json, edit it and move it to /etc/
- if you want to persist the manager / server as a service that starts automatically upon boot, run 'sudo npm install pm2 -g'
- try running the manager in the checkout directory with 'manager/bin/start' exit with Ctrl+c
- try running the server with 'server/bin/www'
- install auto-start with pm2... http://pm2.keymetrics.io/


