# Installation guide for Ubuntu 14.04 server (other systems might be similar)
## Login as root in Ubuntu 14.04 Server, fresh install
Run:

    apt-get install -y git binutils build-essential libicu-dev curl mc
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    apt-get install -y nodejs

Now, tell github your SSH key from your server:

    ssh-keygen
    <press enter, leave all defaults>
    cat ~/.ssh/id_rsa.pub
    < PASTE AS SSH KEY IN GITHUB IN YOUR PROFILE SETTINGS >

From the repository, clone AC-Proto, run:

    mkdir ac-proto
    cd ac-proto
    git clone git@github.com:sozialhelden/ac-machine.git .
    mkdir logs
    npm install
    ./create_settings
    mv ac-settings.json /etc/
    mcedit /etc/ac-settings.json

EDIT `/etc/ac-settings.json`, change port for www server to 80.

Enable auto-start, make sure current directory is still /root/ac-proto:

    npm install pm2 -g

    pm2 startup
    pm2 start manager/bin/start -i 1 --name "AC-Manager"
    pm2 start server/bin/www -i 1 --name "AC-WWW-Server"
    pm2 show 0
    pm2 show 1
    pm2 save
    
    reboot

Server should be up at port 80, manager at port 3000.


## A slightly more generic install-guide
- follow install-guide and [install nodejs 6+](https://nodejs.org/en/download/package-manager/)
- run `apt-get install build-essentials`
- checkout repository in a directory of your choice
- run 'npm install' in that directory
- run the script `./create_settings`. It will create a file called `ac-settings.json`, edit it and move it to `/etc/`.
- If you want to persist the manager/server as a service that starts automatically upon boot, run `sudo npm install pm2 -g`
- Try running the manager in the checkout directory:
 
        node manager/bin/start 
     
- Try running the server:

        node server/bin/www

- To install auto-start with pm2 read more under [pm2.keymetrics.io](http://pm2.keymetrics.io/)

## Notes on installation under MacOS

### Creating settings-files
Adjust node-path to `/local`:

    #!/usr/local/bin/node
    s=require('./converter/converter').GetSettings();
    console.log('Please run (as root) mv ac-settings.json /etc/');

If you get an error like `Error: Module version mismatch. Expected 48, got 46.`, make to to install the latest version of node and npm...
     
    ac-machine»node -v
    v6.5.0
    ac-machine»npm -v
    3.10.3

... or try to rebuild npm:

    sudo npm rebuild
    




