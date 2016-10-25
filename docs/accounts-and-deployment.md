The following guide explains the steps of setting up all accounts and doing a deployment of the accessibilty-cloud meteor application. Details can change any time.

Time of last update Sep. 2016

# Create galaxy account
This is required for a fast hosting of meteor Apps.

- Login to [https://eu-west-1.galaxy.meteor.com/](https://eu-west-1.galaxy.meteor.com/)
- Click **Get Galaxy**
- Click **With Organization**
- Create new organization `socialheroes`. (Sadly we can't use sozialhelden, because that's our login-name, and an organization may not of a name already taken by a user).
- Add members z.b. `hypo`, `pixtur`, ...
- Select "Galaxy App Hosting"
- Select **EU-West** as the region to prefer the European deployment and hosting infrastructure.
- Add payment method
- Login to galaxy EU-West:

copy deployment-comment...

    DEPLOY_HOSTNAME=eu-west-1.galaxy-deploy.meteor.com meteor deploy [hostname] --settings path-to-settings.json

# MLAB (MongoDB)
- login at http://mlab.com
- Click Create New
  - Check Region Amazon EU Ireland
  - select option like "Shared Cluster (shared, 1 GB storage; expand up to 8 GB for additional per-byte charge)"
  - select latest mongoDB-Version (e.g. 3.2.9 MMAPv1)
- select a database name 'ac-production'
  - ignore the "Database name warning - close If you want to change this database name in the future, you will not be able to do so without downtime."
- for a free version select "sandbox"
- click "create database"

## Add database-user
- Select database
- Click users
- Select user-name like 'staging'
- Create secure password (e.g. 1password)
- Copy access-urls:
 
Access-Urls:

    mongo ds033956.mlab.com:33956/ac-staging -u <dbuser> -p <dbpassword>

To connect using a driver via the standard MongoDB URI:

    mongodb://<dbuser>:<dbpassword>@ds033956.mlab.com:33956/ac-staging

## save deployment-settings

Create `settings/staging.json` with...

    {
        "galaxy.meteor.com": {
            "env": {
                "ROOT_URL": "https://....meteorapp.com",
                "MONGO_URL": "mongodb://staging:<password>@ds013664.mlab.com:13664/",
                "MAIL_URL": "smtp://development%40vr-roadshow.com:<password>@smtp.mailgun.org:465"
            }
        },
        "s3": {
            "key": "AKI...",
            "secret": "..."
        },
        "public": {
            "s3": {
                "bucket": "...",
                "region": "eu-west-1"
            }
        },
        "kadira": {
            "appId": "",
            "appSecret": ""
        }
    }

add to `.gitignore`

    node_modules/
    settings/*
    !settings/*-example.json

# Deploy

    DEPLOY_HOSTNAME=eu-west-1.galaxy-deploy.meteor.com meteor deploy acloud.eu.meteorapp.com --settings settings/staging.json


# Check app status

Login to 
[eu-west-1.galaxy.meteor.com](https://eu-west-1.galaxy.meteor.com/app/acloud.meteorapp.com)

- Click "Apps"
- Click on the app (e.g. acloud.meteorapp.com)
- Click "Logs"  


# Mailgun
- later

# Kadira


# Checking the database with mongoLab (MacOS)

- Download and install [MongoLab](https://mongohub.s3.amazonaws.com/MongoHub.zip)
- Click [+] to create a new app and fill out:
    - Name: `ac-staging`
    - Server `Standalone`
    - Addresse: `ds033956.mlab.com`:`33956`
    - User: `staging`
    - Password: (see above)
    - Database: `ac-staging`

# Purging the database 


