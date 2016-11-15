# Accessibility Cloud API

Accessibility Cloud allows you to request accessibility data via HTTP in JSON format.


## Features

- Free access
- Allow your users to find places by location, category or other metadata
- Augment your own data with accessibility information
- Requests over HTTP
- GeoJSON-compatible output format


## Getting started

- Sign up for Accessibility Cloud
- Create an organization on the web page
- Add an app for your organization
  - The created app comes with a free API token that allows you to make HTTP requests to our API.
  - To start using the API, follow the instructions in your app's settings on the web page.
- If you start on the command line, we recommend piping your curl output through
  [`jq`](https://stedolan.github.io/jq/) when testing API requests in the command line.
  `jq` can be installed using your favorite package manager (e.g. with `apt-get install jq` on
  Debian-based Linux or `brew install jq` on Macs).


## Authentication

For every app you create, you get an authentication token. This token allows you to use the JSON API. To authenticate a single request, you have to supply a HTTP header `X-Api-Token: 12345` (replace `12345` with your own API token).

Your API token allows you to access the following data:
- Your organization's profile data
- Content of your own organizations' data sources
- Content of other organizations' data sources, if the sources meet the following criteria
  - the source is not in draft mode
  - your organization is allowed to access the data source (or the data source is publicly available)
  

## Features for all endpoints

### Licensing

Responses containing data that is provided under a specific license contain the licenses of all result in the JSON response. Each license has a `_id` field. Results of the response can refer to their licenses using this id (using a `licenseId` field).

### Pagination

API result sets are paginated. On one page, maximally 1000 results are returned. To get a specific result page, use the `skip` parameter with the number of results you want to skip, and the `limit` parameter to set the maximal number of results you want the server to return.

### Filtering returned fields

To get a specific set of returned JSON fields only (e.g. to save bandwidth), you can use the `exclude` and `include` GET query parameters. For both parameters, the server accepts a comma-separated list of field paths, e.g. `include=properties.name,geometry`.

### Error handling

The server uses HTTP status codes for a general categorization of the errors you get back. Typical error codes:

- `404`: The resource you requested could not be found.
- `401`: Your request was not authenticated (e.g. because the token was missing or invalid)
- `402`: You don't have the necessary privileges to access the requested resource
- `422`: Your request did not have the right format, e.g. you supplied invalid parameters
- `500`: Your request could not be processed because there was an internal server error.

All error responses from the JSON API contain a JSON body with `reason` and a `details` fields. For responses with `422` status code, the details field can contain an array with validation errors for each supplied parameter, e.g. like this:

```json
{
  "error": {
    "reason": "Longitude is required",
    "details": [
      {
        "name": "longitude",
        "type": "required",
        "details": {
          "value": null
        }
      },
      {
        "name": "accuracy",
        "type": "required",
        "details": {
          "value": null
        }
      }
    ]
  }
}
```

## Endpoints

### GET /place-infos

Returns place infos (POIs) from arbitrary data sources. The response is a [GeoJSON FeatureCollection](http://geojson.org/geojson-spec.html#feature-collection-objects).

For requests to this endpoint, the following additional parameters are supported:

#### Data source filtering

- `includeSourceIds`: comma-separated list of source ids you want to include, e.g. `QGf3sjbSxSpkeNHFm,eWrPejvNrE5AFB7bx`
- `excludeSourceIds`: same as `includeSourceIds`, but excludes specific sources from results. This is helpful if you have your own data source on accessibility.cloud and want to show additional results on a web page without showing your own data source's results twice on the same view.

#### Location-based search

You can request POIs around a specific map location. For this, you have to supply all three of the following parameters:

- `latitude`, `longitude`: WGS84 geo-coordinates (as floating point strings). When supplied, these coordinates are used as center for a location-based place search.
- `accuracy`: Search radius for location-based place search, in meters (floating point). Maximal allowed value is `10000`.

#### Example request

```bash
curl -v -s \
    -H 'Accept: application/json' \
    -H 'X-Token: YOUR_TOKEN_HERE' \
    https://www.accessibility.cloud/place-infos\?latitude\=48.24350856260559\&longitude\=16.39748637322089\&accuracy\=1000\&includeSourceIds\=QGf3sjbSxSpkeNHFm | jq .
```

#### Example response

```json
{
  "type": "FeatureCollection",
  "featureCount": 3,
  "related": {
    "licenses": {
      "ksZeCT5iukcsigZhQ": {
        "_id": "ksZeCT5iukcsigZhQ",
        "name": "Open Restaurant License",
        "plainTextSummary": "The open restaurant license allows you to share restaurant data exactly in the time intervals when the restaurant is open. Outside the opening times, sharing is forbidden.",
        "consideredAs": "restricted",
        "organizationId": "JvmSCpsocEvDcgfkb"
      }
    }
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          16.39748637322089,
          48.24350856260559
        ]
      },
      "properties": {
        "originalId": "WCANLAGEOGD.325800",
        "category": "toilets",
        "name": "Öffentliche Toilette",
        "address": "Damm autom. selbstr. Familienbadestrand, Bezirk 22, Vienna, Austria",
        "accessibility": {
          "accessibleWith": {
            "wheelchair": true
          }
        },
        "sourceId": "QGf3sjbSxSpkeNHFm",
        "sourceImportId": "yEQBjistheHWLfvG3",
        "_id": "g6DyPyuGPbR2bRHML",
        "distance": 0
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          16.391322824757268,
          48.244053162833104
        ]
      },
      "properties": {
        "originalId": "WCANLAGEOGD.325799",
        "category": "toilets",
        "name": "Öffentliche Toilette",
        "address": "Donauinsel autom. selbstr. Beachvolleyballpl., Bezirk 21, Vienna, Austria",
        "accessibility": {
          "accessibleWith": {
            "wheelchair": true
          }
        },
        "sourceId": "QGf3sjbSxSpkeNHFm",
        "sourceImportId": "yEQBjistheHWLfvG3",
        "_id": "nho3WmyqaW52nc6Cs",
        "distance": 460.0797197954276
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          16.40251909699923,
          48.23904145814893
        ]
      },
      "properties": {
        "originalId": "WCANLAGEOGD.325782",
        "category": "toilets",
        "name": "Öffentliche Toilette",
        "address": "Donauinsel Anlage NEU 10, Bezirk 21, Vienna, Austria",
        "accessibility": {
          "accessibleWith": {
            "wheelchair": false
          }
        },
        "sourceId": "QGf3sjbSxSpkeNHFm",
        "sourceImportId": "yEQBjistheHWLfvG3",
        "_id": "bJY23bukFmpayGSvA",
        "distance": 620.5354929354854
      }
    }
  ]
}
```

### GET /apps

TODO

### GET /languages

TODO

### GET /licenses

TODO

### GET /organizations

TODO

### GET /source-imports

TODO

### GET /sources

TODO
