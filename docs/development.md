# Development



## Running locally

- Have Meteor.js (>1.4) and Node.js (>6.5) installed.
- `cd` into the meteor app directory in your terminal
- Run `npm install` to install necessary dependencies
- Run `meteor --settings settings/local.json` to start the app
- Navigate to [http://localhost:3000](http://localhost:3000).



## Development

The project uses ECMAScript6 and contains a configuration for Sublime Edit + ESLint. [Setting up ESLint](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48) is a bit tedious, but worth it, as it gives you static analysis, notifies you about potential logic issues, JS-typical pitfalls and enforces a styleguide. The configuration is derived from [AirBnb's ESLint configuration](https://github.com/airbnb/javascript/blob/master/es5).

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

