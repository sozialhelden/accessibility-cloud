# Accessibility Cloud API – JavaScript example application


## Running the example

Right now the sourcecode of the example resides inside the [ repository](https://github.com/sozialhelden//tree/master/public/js-example). Eventually it will be moved into its own little sub-repository. To get it running you have to go through the following steps:

### Sign up / in

1. Open https://acloud.eu.meteorapp.com/
2. Click *Sign up* or *Login*

### Obtain an API token

1. Create an organization

2. Fill out and submit the organization form and submit. You will be forwared to the organization view.

3. Click "API Clients" in the header

4. Click "Add API client", fill out and submit the form.

5. **NOTE**: on the right side you should see your token with an example `curl` statement. Due to [a bug](https://trello.com/c/zLtQocpn/211-api-token-not-displayed-after-creating-the-first-api-client-of-a-new-organizations) the page might not get refreshed correctly, so you have to reload the page (Cmd-Shift-R on Mac, Shift+F5 on Linux/Windows) and update the information.

6. Copy your *API access token*.

    ![api-token-view](http://i.imgur.com/SLkyvER.png)

### Run the client

6. Either checkout the repository or use the following (by now probably outdated) [zip-archive](https://dl.dropboxusercontent.com/u/5503063/ac/examples/js-example.zip).
7. Open `index.html` with your favorite text editor and replace the *API token* around line 22 with the one you copy from above.
8. Open index.html in your web-browser. The result should look similar to this: ![js-api-client-example](http://i.imgur.com/kfk0cMS.png)

## Comments on the code

To balance readibility and code size, we're using the [Mustache template engine](https://github.com/janl/mustache.js) (10k) and jQuery. To not duplicate libraries on your side, how you integrate these libraries is up to you (`index.html` contains an example how). The only relevant files are `accessibility.cloud.js` (our JS library) and `index.html` (which includes this library).

### index.html

This is a very short file whose main purpose is to execute the following script:

```html
    <script>
      $(function() {
        AccessibilityCloud.token = 'd48f45736594c3f00cbb39bde2388791'; // <-- Replace this token with your own
        var element = document.querySelector('.ac-results');
        var parameters = { latitude: 40.728292, longitude: -73.9875852, accuracy: 10000, limit: 100 };
        AccessibilityCloud.loadAndRenderPlaces(element, parameters);
      });
    </script>
```

Note that it includes the API token, which you have to replace with the one you get on [accessibility.cloud](https://acloud.eu.meteorapp.com) for your own API client. It also includes an example request (in this case for places in Manhattan). For more information on the available parameters, refer to the [documentation on the API](https://github.com/sozialhelden//blob/master/docs/json-api.md).

### accessibility.could.js

We're working on providing a small and easy-to-use client library the helps with…

- sending API-requests
- formatting the JSON-response
- handling attribution / credits as required by licenses

Keep in mind that this client-side library is under heavy development and is likely to change.





