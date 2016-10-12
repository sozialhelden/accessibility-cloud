Accessibility Cloud  Source Code

This explains how to setup the development environment and make builds.

Meteor part
===========

Running locally
---------------

- Have Meteor.js and Node.js installed.
- `cd` into the meteor app directory in your terminal
- Run `npm install` to install necessary dependencies
- Run `meteor --settings settings/local.json` to start the app
- Navigate to [http://localhost:3000](http://localhost:3000).


Development
-----------

The project uses ECMAScript6 and contains a configuration for Sublime Edit + ESLint. [Setting up ESLint](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48) is a bit tedious, but worth it, as it gives you static analysis, notifies you about potential logic issues, JS-typical pitfalls and enforces a styleguide. The configuration is derived from [AirBnb's ESLint configuration](https://github.com/airbnb/javascript/blob/master/es5).

Please work on the `development` branch and only merge it into `master` after a QA of the deployed `development` branch on the development/staging server.


Administration
--------------

There is an admin interface on `http://localhost:3000/admin`. You can use it to sign up on the top. Add `"isAdmin": true` as attribute in your user MongoDB document to gain full access to all data.


Deployment
----------

Talk to Sebastian if you need login credentials to the following services we use:

- Mailgun
- Meteor Galaxy (app servers)
- mhub (MongoDB servers)
- Kadira (for Meteor server monitoring)

To deploy the app, follow these steps:

- [ ] Deploy on staging first, do a manual full QA there
- [ ] Merge `development` into `master` if the QA succeeds
- [ ] Do a production deployment. Don't do it if no developer is there to check if errors might happen at runtime after deployment. Note that every deployment needs a bit of monitoring before keeping it.
- [ ] After production deployment, do another manual full QA round there
- [ ] If the QA succeeds: Merge `master` into `stable` and create a semver tag. If not, roll back to `stable` and re-deploy.


Staging-Server
--------------
TbD


