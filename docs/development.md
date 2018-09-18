# Development

## Running locally

- Have [Meteor.js](https://www.meteor.com/install) (>1.4) installed
- Have Node.js (>6.5) installed.
- `cd` into the meteor app directory in your terminal
- Run `meteor npm install` to install necessary dependencies
- Run `meteor --settings settings/local.json` to start the app
- Navigate to [http://localhost:3000](http://localhost:3000).


## Development

Please work on the `development` branch and only merge it into `master` after a QA of the deployed `development` branch on the development/staging server.

## Guidelines

- obey the ESLint guides even if if hurts
- files names and folders are always lower-case-with-dashes

## Administration

There is an admin interface on `http://localhost:3000/admin`. You can use it to sign up on the top. Add `"isAdmin": true` as attribute in your user MongoDB document to gain full access to all data.

## Deployment

TbD

## Staging-Server

TbD
