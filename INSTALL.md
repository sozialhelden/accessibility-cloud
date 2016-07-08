# Install guide for Ubuntu 14+
- follow install-guide and install nodejs 6+: https://nodejs.org/en/download/package-manager/
- checkout repository in a directory of your choice
- run 'npm install' in that directory
- if you want to persist the manager / server as a service that starts automatically run 'sudo npm install pm2 -g'
- run in the checkout dir the script ./create_settings it will create a file called ac-settings.json, edit it and move it to /etc/
- try running the manager with manager/bin/start exit with Ctrl+c
- try running the server with server/bin/www
- install auto-start with pm2
