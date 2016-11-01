# Accessibility Cloud API – JavaScript example application



## Running the example

Right now the source-code of the example resides inside the [ac-machine repository](https://github.com/sozialhelden/ac-machine/tree/master/public/js-example). Eventually it will be moved into its own little sub-repro. To get it running you have to go through the following steps:

### Sign up / in

1. Open https://acloud.eu.meteorapp.com/
2. Click sign up or login

### Create an API-token

1. Create an Organization

2. Fill out the Organization-form and submit. You will be forwared to the Organization view.

3. Click "API-Clients" in the header

4. Click "Add API-client" and fill out and submit the form.

5. **NOTE**: on the left right side you should see your token with an example curl-statement. Due to [a bug](https://trello.com/c/zLtQocpn/211-api-token-not-displayed-after-creating-the-first-api-client-of-a-new-organizations) the page gets not refreshed correctly, so you have to press CMD+SHIFT+R to reload the page and update the information. 

6. Copy your *API access token*.

    ![api-token-view](http://i.imgur.com/SLkyvER.png)

### Run the client

6. Either checkout the repository or use the following (by now probably outdated) [zip-archive](https://dl.dropboxusercontent.com/u/5503063/ac/examples/js-example.zip).
7. Open `index.html` with your favorite text editor and replace the *API token* around line 22 with the one you copy from above.
8. Open index.html in your web-browser. The result should look similar to this: ![js-api-client-example](http://i.imgur.com/kfk0cMS.png)



## Comments on the code

To balance readibility and code size, we're using the [Mustance template engine](https://github.com/janl/mustache.js) (10k) and jQuery. The only relevant files are  `index.html` and `accessibility.cloud.js`. 

### index.html

This is a very short file which main-purpose is the execution of the following script:

```html
    <script>
      $(function() {
        AccessibilityCloud.token = 'd48f45736594c3f00cbb39bde2388791';
        var element = document.querySelector('.ac-results');
        var parameters = { latitude: 40.728292, longitude: -73.9875852, accuracy: 10000, limit: 100 };
        AccessibilityCloud.loadAndRenderPlaces(element, parameters);
      });
    </script>
```

Notice that includes the API-token that you have to replace with the one you get on [accessibility.cloud](https://acloud.eu.meteorapp.com) for your own API client. It also includes an example request (in this case for places in Manhatten). For more information on the available parameters, refer to the [documentation on the API](https://github.com/sozialhelden/ac-machine/blob/master/docs/json-api.md).

### accessibility.could.js

We're working on providing a small and easy to use client-library the helps with...

- sending API-requests
- formatting the JSON-repsonse
- handling attribution / credits as required by licenses

Keep in mind, that this client-side library is under heavy development and is like to change.





