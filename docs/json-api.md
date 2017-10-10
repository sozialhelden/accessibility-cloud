# Accessibility Cloud API

Accessibility Cloud allows you to request accessibility data via HTTP in JSON format.

<!-- TOC -->

- [Accessibility Cloud API](#accessibility-cloud-api)
  - [Features](#features)
  - [Getting started](#getting-started)
  - [Authentication](#authentication)
  - [Features for all endpoints](#features-for-all-endpoints)
    - [Licensing](#licensing)
    - [Pagination](#pagination)
    - [Filtering returned fields](#filtering-returned-fields)
    - [Embedded related resources](#embedded-related-resources)
    - [Sorting](#sorting)
    - [Error handling](#error-handling)
  - [Endpoints](#endpoints)
    - [GET /place-infos](#get-place-infos)
      - [Data source filtering](#data-source-filtering)
      - [Location-based search](#location-based-search)
      - [Filter by metadata](#filter-by-metadata)
      - [Embedding related documents](#embedding-related-documents)
      - [Example request](#example-request)
      - [Example response](#example-response)
    - [GET /apps](#get-apps)
    - [GET /categories](#get-categories)
    - [GET /languages](#get-languages)
    - [GET /licenses](#get-licenses)
    - [GET /organizations](#get-organizations)
    - [GET /source-imports](#get-source-imports)
    - [GET /sources](#get-sources)

<!-- /TOC -->

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

For every app you create, you get an authentication token. This token allows you to use the JSON API. To authenticate a single request, you have to supply a HTTP header `X-App-Token: 12345` (replace `12345` with your own app token).

Your API token allows you to access the following data:

- Your organization's profile data
- Content of your own organizations' data sources
- Content of other organizations' data sources, if the source
  - is not in draft mode
  - is accessible for your organization (or publicly available)


## Features for all endpoints

### Licensing

Responses containing data that is provided under a specific license contain the licenses of all result in the JSON response. Each license has a `_id` field. Results of the response can refer to their licenses using this id (using a `licenseId` field).

### Pagination

API result sets are paginated. On one page, maximally 1000 results are returned. To get a specific result page, use the `skip` parameter with the number of results you want to skip, and the `limit` parameter to set the maximal number of results you want the server to return.

### Filtering returned fields

To get a specific set of returned JSON fields only (e.g. to save bandwidth), you can use the `exclude` and `include` GET query parameters. For both parameters, the server accepts a comma-separated list of field paths, e.g. `include=properties.name,geometry`.

### Embedded related resources

Result list returned via the API often contain references to other documents by ID. See the `/place-infos` endpoint for an example how to embed related documents directly in the result response list.

### Sorting

You can sort results by using the `sort` parameter. For this parameter, the servers accept a field path, e.g. `sort=properties.address`. Sort order is ascending by default. If you want to sort in descending order, add a `descending=1` parameter to your request.

### Error handling

The server uses HTTP status codes for a general categorization of the errors you get back. Typical error codes:

- `404`: The server could not find the resource you requested.
- `401`: Your request was not authenticated (e.g. because the token was missing or invalid)
- `402`: You don't have the necessary privileges to access the requested resource
- `422`: Your request did not have the right format, e.g. you supplied invalid parameters
- `500`: The server could not process your request because there was an internal error.

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

For requests to this endpoint, the API supports the following parameters:

#### Data source filtering

- `includeSourceIds`: comma-separated list of source ids you want to include, e.g. `QGf3sjbSxSpkeNHFm,eWrPejvNrE5AFB7bx`
- `excludeSourceIds`: same as `includeSourceIds`, but excludes specific sources from results. This is helpful if you have your own data source on accessibility.cloud and want to show additional results on a web page without showing your own data source's results twice on the same view.

#### Location-based search

You can request POIs around a specific map location. For this, you have to supply all three of the following parameters:

- `latitude`, `longitude`: WGS84 geo-coordinates (as floating point strings). When supplied, these coordinates are used as center for a location-based place search.
- `accuracy`: Search radius for location-based place search, in meters (floating point). Maximal allowed value is `10000`.

#### Filter by metadata

The server has a database for additional metadata-based filter presets that you can use in your queries. If you need a specific query, [let the accessibility.cloud team know](mailto:support@accessibility.cloud).

To use a filter, add this parameter:

- `filter`: a String identifying the preset used to filter your data, e.g. `at-least-partially-accessible-by-wheelchair`.

Currently, the following filter presets are supported:

- `at-least-partially-accessible-by-wheelchair`
- `fully-accessible-by-wheelchair`
- `not-accessible-by-wheelchair`
- `unknown-wheelchair-accessibility`

#### Embedding related documents

In the same way, the API allows you to get customized additional details for results in a special field named `related` that is embedded in the server response, like this:

```javascript
{
  "type": "FeatureCollection",
  "featureCount": 1,
  "related": {
    "licenses": {
      "4HgSTHdeQMA9pvJNM": {             // license of the source below
        "_id": "4HgSTHdeQMA9pvJNM",
        "name": "Public Domain",
        ...
      }
    },
    "sources": {
      "eWrPejvNrE5AFB7bx": {
        "name": "Another data source",
        "licenseId": "4HgSTHdeQMA9pvJNM", // reference to the license above
        ...
      }
    }
  },
  "features": [
    {
      "type": "Feature",
      "geometry": { ... },
      "properties": {
        "sourceId": "eWrPejvNrE5AFB7bx", // reference to the source above
        ...
      }
    }
  ]
}
```

The data source document is added to the response after adding the `include=source` parameter.

If given, the `include` parameter has to be a comma-separated list of relation names. Allowed relation names for places are:

- `source`
- `source.organization`
- `source.license`
- `sourceImport`
- `source.language`

#### Example request

```bash
curl -v https://www.accessibility.cloud/place-infos.json\?appToken\=YOUR_APP_TOKEN_HERE&latitude\=48.2435\&longitude\=16.3974\&accuracy\=1000\&includeSourceIds\=QGf3sjbSxSpkeNHFm&include=source | jq .
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
        "name": "Accessibility License",
        "plainTextSummary": "A summary…",
        "consideredAs": "restricted",
        "organizationId": "JvmSCpsocEvDcgfkb"
      },
      "sources": {
        "QGf3sjbSxSpkeNHFm": {
          "name": "",
          "licenseId": "ksZeCT5iukcsigZhQ"
        }
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

### GET /categories

Returns all categories known to accessibility.cloud, together with their translated names in the given `locale`.

#### Example request

```bash
curl https://www.accessibility.cloud/categories.json\?appToken\=YOUR_APP_TOKEN_HERE\&locale\=en | jq
```

#### Example response

```json
{
  "count": 172,
  "totalCount": 172,
  "related": {},
  "results": [
    {
      "_id": "car_sharing",
      "icon": "car_sharing",
      "parentIds": [
        "transport"
      ],
      "translations": {
        "_id": {
          "de": "Carsharing",
          "en": "Car sharing"
        }
      },
      "synonyms": [
        "amenity=car_sharing"
      ]
    },
    ...
  ]
}
```

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
