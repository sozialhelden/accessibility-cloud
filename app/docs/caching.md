# How caching works on accessibility.cloud

## CDNs and surrogate keys

Providing a backend for map tiles can be stressful for a server at times 😪 To solve this, humans
invented CDNs and caching.

When two users request the same dataset, there is no need to recalculate which places are inside that
dataset—we should save the response somewhere and provide a copy of it to the second
requester instead of letting each request hit the app and the database.

This guarantees fast responses for every requester after the first one and keeps our load ow. It
creates new problems though:

- How can we maximize the caching time to minimize the number of requests handled by the backend?
- How and when do we throw a saved response out of the cache to recalculate it on request?
- How do we avoid outdated responses?

### How CDNs usually work

A CDN provides storage for caching responses, optimally in many regions of the world. When somebody
requests a URL from our server, the request hits the CDN first, the CDN then looks up if a fitting
response is in its cache, and forwards the request to our backend if it's not there yet.

To find out if a response is already cached, the CDN looks at the URL and the HTTP response headers
that the response lists in the response's `Vary:` header. Each combination of a URL and these header
values makes up a new, valid cache key. If the CDN finds the requested combination in its cache (and
the value is not older than the specified TTL), it sends the cached response to the client.

This allows to serve different variants of the same URL, for example for different values of
the `Content-Language` response header.

### Using surrogate keys to tag responses

If the data behind any response changes, we must purge the response from the cache and recalculate
it. For this,

- we tag responses with so-called **surrogate keys** so the CDN knows about their content (using
  the `Surrogate-Keys:` response header)
- we send one or more surrogate keys to the CDN when data changes, so the CDN can purge all
  responses with that content from its caches

#### Purging responses with changed / removed documents

We include the MongoDB document `_id`s of anything contained in a JSON response (including related
documents). When we change or remove documents, we send their `_id`s to the CDN for purging all
responses containing them.

#### Purging responses to geographic area-based requests

It's a bit more complex to solve the case where a JSON response to a request **misses** a document
that appeared while the response is already cached.

When an import adds a place or equipment, it invalidates each tile that this place is part of, going
through all possible zoom levels. This way, we can purge circle-based requests and tile coordinate-
based requests alike, using the same surrogate key scheme.

Surrogate keys for a tile coordinate at a given zoom level use the popular
[slippy map](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) tile name scheme.

For circle-based requests, we find the smallest 4-6 tiles around a requested circle geometry and use
their coordinate tags for purging.

See [this Observable notebook](https://beta.observablehq.com/@opyh/speed-up-radius-based-geo-queries-over-cdn)
for a visual explanation of this.
