# Accessibility Walk through

The follwoing document discribes a primary journey through Accessibility Cloud. In that is can be the basis for a small ScreenCast. The following list is quiet extensive and includes features that still await implementation. Features that should be working already are marked with a checkmark.

## Browsing

- [x] Open [AC](https://acloud.eu.meteorapp.com/) with a modern browser
- [x] The page loads quickly and without entering a password.
- [ ] You can read documentation and introductional content about the service.
- [ ] You can see some markers with colors on the map in the background ()
- [x] You can click "**browse sources**" to see a list of the "published/non-draft" sources
- [x] You can click on a source and get a map with its markers, a description, its license and a link to its website.

## Signing up

- [x] You can click "sign-up" and enter you credentials...
- [ ] ...but, until further work on the [security of back-end](https://trello.com/c/a6ROhrCH/209-prevent-un-moderated-input-of-javascript-code-into-source-mapping-definitions), we have to restrict the signup
- [ ] you learn that your account is waiting for verification with and also see a contact email-address for support (that will be forwarded to holger)
- [ ] once an administrator saw your request on the "[pending verfications-list](https://trello.com/c/gEo7n1nJ/210-added-a-pending-user-verifications-list-for-administrators)" and verifies your account, you can login.

## Creating an Orginization

- [x] You learn that before doing anything meaningful, you have to create or join an *Organizations*
- [ ] A member can invite/add you to an existing organization.
- [x] Or, you can create a new organization.

## Creatign a Data Source

- [ ] You learn that to share data, you need to create *a data source*.
- [ ] You can create *a data source* for your new *Organization*.
- [ ] In the create data-source form, you see that each data-source requires a license.
- [ ] You can check the existing *predefined licenses*, but... 
- [ ] ...you decided to add a new custom license for your data source.
- [ ] You create a license by filling out the form.
- [ ] In your data-source-settings you set your custom license.
- [ ] In your data-source-setting you also define, how frequently the source should be updated.

## Sharing Data Sources

- [x] You learn that you need to define how your data-source is mapped into the ac-format.
- [x] You learn that there is a generic [ac-format](ac-format.md) and how you can find additional documentation on that topic.
- [ ] You click a link to find more documentation [on github](https://github.com/sozialhelden/ac-machine/tree/master/docs) and are happy to see that this is a freely accessible open source project.
- [x] You learn that you don't have to understand how to map your data – you can always find help from the ac-community through the support-email-address (or other channels).
- [x] You can update your data, so some members of the AC-community can then help you converting the data-format.
- [ ] You can initialize the source-import-definition from a list of templates for importing CSV and JSON.
- [x] You can edit the information in a textarea, but...
- [ ] …you can't save the updated definition until all the errors are fixed.
- [x] Once you updated the information you can press *import* and see that a new progress is now running in the background and indicates its process with a collection of progress bars.
- [ ] You understand that importing data is really complicated but are happy to find a link to the extensive documentation on importing data on github.
- [x] In the settings you also control which organizations can access the data source.

## Accessing Data

- [ ] You learn that you can also access data of other organizations on AC.
- [ ] You can download all availble data of sources for which the license allows so as a zip-archive.
- [ ] You learn that you can access the data via an API, but that for doing so you're required to create an *API client*.
- [ ] You create an API-client.
- [ ] You try the example code with your token by pasting it to your terminal.

## API-Client example / Using the API

- [ ] You see the link the javascript-example code and its documentation.
- [ ] You follow the steps on the documentation:
- [ ] You clone the repository.
- [x] You open the example in the browser.
- [ ] You learn that the API tokens are missing.
- [x] You can copy the API-tokens from Accessibility cloud and quickly find where to insert them into the javascript code
- [x] You see that the javascript-code ist very small, easy to read and well documented. 
- [ ] You can quickly integrate it into your existing application.
- [ ] It's easy to adjust the minimal CSS-definitions to integrate the the widget seamlessly into your app
- [ ] You can extend the original API-example be also showing place-markers on the map and lists of your application.




## Support

- [ ] You plan to show markers from the API on a map. You start coding but get stuck in a problem. You quickly find where to ask questions and discuss your problem (e.g. github-issues, forum, email, irc-channel, etc.).



## More

- [ ] After logout I will be forwarded to the start-page
- [ ] ​