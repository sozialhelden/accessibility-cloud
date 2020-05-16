# Development

<!-- TOC depthFrom:2 -->

- [Running locally](#running-locally)
- [Development guidelines](#development-guidelines)
- [Check live app status](#check-live-app-status)
- [Database administration](#database-administration)
- [Deployment](#deployment)

<!-- /TOC -->

## Running locally

- Have [Meteor.js](https://www.meteor.com/install) (>1.4) installed
- Have Node.js (>6.5) installed.
- `cd` into the meteor app directory in your terminal
- Run `meteor npm install` to install necessary dependencies
- Duplicate the `settings/local-example.json` file as `settings/local.json` and insert all values that you need. Ask another developer for a copy for a faster start!
- Run `meteor --settings settings/local.json` to start the app
- Navigate to [http://localhost:3000](http://localhost:3000).
- An admin interface exists on `http://localhost:3000/admin`. You can use it to create a user account.
- Connect to the local MongoDB and set `"isAdmin": true` on your user’s data record to gain access to everything.
- Get a live DB copy from another developer to work with real data on your local machine.

## Development guidelines

- Please work on the feature branches and pull requests. Merge them into `master` after a QA of the deployed `development` branch on the development/staging server.
- obey the ESLint guides even if it hurts :)
- Files names and folders are always lower-case-with-dashes, for now.
- Note that admins see all the data, so the app publishes a lot more data to them, which can slow down the UI. Work with non-admin user accounts for testing new features.

## Check live app status

- Login to [eu-west-1.galaxy.meteor.com](https://eu-west-1.galaxy.meteor.com/socialheroes)
- Click "Apps"
- Click on the app (e.g. `www.accessibility.cloud`)

## Database administration

- Download and install [Robo3T](https://robomongo.org)
- For debugging locally, create a connection to `localhost` like shown here: ![Robo3T Connection Settings](./images/localhost-robo-3t.png)
- For debugging on the live app, log in to [MongoDB Atlas](https://cloud.mongodb.com) with the login credentials you get from us. You find docs how to connect with Robo3T there.

## Deployment

We're using [Meteor Galaxy](https://galaxy-guide.meteor.com) for app hosting and [MongoDB Atlas](https://docs.atlas.mongodb.com) for DB hosting.

For deploying to Meteor Galaxy, you need an extra settings file. Get an account on Galaxy first.

Duplicate `deploy-example.json` as `staging.json` or `production.json` and fill in the values, or ask another developer for a copy of the file.

Run `npm run deploy` to see further instructions.
