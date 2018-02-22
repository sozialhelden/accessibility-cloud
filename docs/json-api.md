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
      - [Location-based search by center/radius](#location-based-search-by-centerradius)
      - [Location-based search by X/Y/Z tile coordinates](#location-based-search-by-xyz-tile-coordinates)
      - [Filter by metadata](#filter-by-metadata)
      - [Filter by category](#filter-by-category)
      - [Embedding related documents](#embedding-related-documents)
      - [Example request](#example-request)
      - [Example response](#example-response)
    - [GET /apps](#get-apps)
    - [GET /categories](#get-categories)
      - [Example request](#example-request-1)
      - [Example response](#example-response-1)
    - [GET /disruptions](#get-disruptions)
      - [Data source filtering](#data-source-filtering-1)
      - [Location-based search](#location-based-search)
      - [Embedding related documents](#embedding-related-documents-1)
      - [Example request](#example-request-2)
      - [Example response](#example-response-2)
    - [GET /equipment-infos](#get-equipment-infos)
      - [Data source filtering](#data-source-filtering-2)
      - [Location-based search](#location-based-search-1)
      - [Embedding related documents](#embedding-related-documents-2)
      - [Example request](#example-request-3)
      - [Example response](#example-response-3)
    - [GET /global-stats](#get-global-stats)
      - [Series filtering](#series-filtering)
      - [Example request](#example-request-4)
      - [Example response](#example-response-4)
    - [GET /languages](#get-languages)
    - [GET /licenses](#get-licenses)
    - [GET /organizations](#get-organizations)
    - [GET /source-imports](#get-source-imports)
    - [GET /sources](#get-sources)

<!-- /TOC -->

## Features

- Free access
- Allow your users to find places by location, category, or other metadata
- Augment your own data with accessibility information
- Requests over HTTP(S)
- GeoJSON-compatible output format
- Get data about places, elevators, escalators, and facility disruptions



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

#### Location-based search by center/radius

You can request POIs around a specific map location. For this, you have to supply all three of the following parameters:

- `latitude`, `longitude`: WGS84 geo-coordinates (as floating point strings). When supplied, these coordinates are used as center for a location-based place search.
- `accuracy`: Search radius for location-based place search, in meters (floating point). Maximal allowed value is `10000`.

#### Location-based search by X/Y/Z tile coordinates

The backend also allows you to request map tile X/Y position and zoom level (Z). The OpenStreetMaps wiki [has an overview about the concept](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames).

Knowing the zoom level you want to request, you can [convert your latitude and longitude coordinates to x/y](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29). Note that x/y coordinates refers to the top left corner of the tile, so if you want to use this for a search centered around a point, you have to calculate the position of the top left corner yourself.

- `x`: x coordinate of the map tile you want to request
- `y`: y coordinate of the map tile you want to request
- `z`: zoom level

#### Filter by metadata

The server has a database for additional metadata-based filter presets that you can use in your queries. If you need a specific query, [let the accessibility.cloud team know](mailto:support@accessibility.cloud).

To use a filter, add this parameter:

- `filter`: a String identifying the preset used to filter your data, e.g. `at-least-partially-accessible-by-wheelchair`.

accessibility.cloud supports the following filter presets:

- `at-least-partially-accessible-by-wheelchair`
- `fully-accessible-by-wheelchair`
- `not-accessible-by-wheelchair`
- `unknown-wheelchair-accessibility`

#### Filter by category

You can either include or exclude categories by using the following parameters:

- `includeCategories`: comma-separated list of category names to include in the search. All other categories are excluded.
- `excludeCategories`: comma-separated list of category names to exclude in the search. All other categories are included.

#### Embedding related documents

In the same way, the API allows you to get customized details for results in an embedded `related` field in the response:

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

For example, the response will include a data source document after adding the `includeRelated=source` parameter.

If given, the `includeRelated` parameter has to be a comma-separated list of relation names. Allowed relation names for places are:

- `source`
- `source.organization`
- `source.license`
- `sourceImport`
- `source.language`
- `equipmentInfos`
- `equipmentInfos.disruptions`
- `disruptions`

#### Example request

```bash
curl -v https://accessibility-cloud.freetls.fastly.net/place-infos.json\?appToken\=YOUR_APP_TOKEN_HERE&latitude\=48.2435\&longitude\=16.3974\&accuracy\=1000\&includeSourceIds\=QGf3sjbSxSpkeNHFm&includeRelated=source | jq .
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
curl https://accessibility-cloud.freetls.fastly.net/categories.json\?appToken\=YOUR_APP_TOKEN_HERE\&locale\=en | jq
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

### GET /disruptions

Returns disruption infos from arbitrary data sources. The response is a [GeoJSON FeatureCollection](http://geojson.org/geojson-spec.html#feature-collection-objects).

For requests to this endpoint, the API supports the following parameters:

#### Data source filtering

- `includeSourceIds`: comma-separated list of source ids you want to include, e.g. `QGf3sjbSxSpkeNHFm,eWrPejvNrE5AFB7bx`
- `excludeSourceIds`: same as `includeSourceIds`, but excludes specific sources from results. This is helpful if you have your own data source on accessibility.cloud and want to show additional results on a web page without showing your own data source's results twice on the same view.

#### Location-based search

You can request POIs around a specific map location. For this, you have to supply all three of the following parameters:

- `latitude`, `longitude`: WGS84 geo-coordinates (as floating point strings). When supplied, these coordinates are used as center for a location-based place search.
- `accuracy`: Search radius for location-based place search, in meters (floating point). Maximal allowed value is `10000`.

#### Embedding related documents

You can embed related documents like in the `place-infos` endpoint.

For example, the response will include associated place and facility/equipment infos after adding the `includeRelated=placeInfo,equipmentInfo` parameter.

If given, the `includeRelated` parameter has to be a comma-separated list of relation names. Allowed relation names for places are:

- `source`
- `source.organization`
- `source.license`
- `sourceImport`
- `source.language`
- `placeInfo`
- `equipmentInfo`

#### Example request

```bash
curl -v https://accessibility-cloud.freetls.fastly.net/disruptions.json\?appToken\=YOUR TOKEN HERE\&includeRelated\=equipmentInfo\&limit\=1 |
```

#### Example response

```json
{
  "type": "FeatureCollection",
  "featureCount": 1,
  "totalFeatureCount": 159,
  "related": {
    "equipmentInfos": {
      "KNzmFCkq9Fod9jAKF": {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            13.3869289,
            52.52093915
          ]
        },
        "properties": {
          "category": "escalator",
          "originalId": "10095415",
          "originalPlaceInfoId": "527",
          "isWorking": false,
          "sourceId": "nwccXsd9WMekvFs3r",
          "sourceImportId": "ZNCp79ofnzXDCTPQi",
          "placeInfoId": "vrQ3hnmdZnaMvmp3m",
          "_id": "KNzmFCkq9Fod9jAKF"
        }
      }
    },
    "licenses": {
      "ns5HmC6xFrakRdoJ5": {
        "_id": "ns5HmC6xFrakRdoJ5",
        "name": "CC-BY 4.0 International",
        "shortName": "CC-BY 4.0 Int.",
        "websiteURL": "https://creativecommons.org/licenses/by/4.0/",
        "fullTextURL": "https://creativecommons.org/licenses/by/4.0/legalcode",
        "consideredAs": "CCBY",
        "organizationId": "6ZhFGZ97omm6uKyfn"
      }
    }
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          13.386934058,
          52.520336851
        ]
      },
      "properties": {
        "originalId": "30400715",
        "originalEquipmentInfoId": "10095415",
        "originalPlaceInfoId": "527",
        "category": "escalator",
        "lastUpdate": {
          "$date": 1510119891000
        },
        "sourceId": "9JcQxdE2PAFxLTEJc",
        "sourceImportId": "wyvKYaPYNR54AwtQ6",
        "placeInfoId": "vrQ3hnmdZnaMvmp3m",
        "equipmentInfoId": "KNzmFCkq9Fod9jAKF",
        "_id": "SdGFAf7ZgmSz2YERS"
      }
    }
  ]
}
```

### GET /equipment-infos

Returns equipment / facility infos from arbitrary data sources, for example elevators and escalators.

The response is a [GeoJSON FeatureCollection](http://geojson.org/geojson-spec.html#feature-collection-objects).

For requests to this endpoint, the API supports the following parameters:

#### Data source filtering

- `includeSourceIds`: comma-separated list of source ids you want to include, e.g. `QGf3sjbSxSpkeNHFm,eWrPejvNrE5AFB7bx`
- `excludeSourceIds`: same as `includeSourceIds`, but excludes specific sources from results. This is helpful if you have your own data source on accessibility.cloud and want to show additional results on a web page without showing your own data source's results twice on the same view.

#### Location-based search

You can request POIs around a specific map location. For this, you have to supply all three of the following parameters:

- `latitude`, `longitude`: WGS84 geo-coordinates (as floating point strings). When supplied, these coordinates are used as center for a location-based place search.
- `accuracy`: Search radius for location-based place search, in meters (floating point). Maximal allowed value is `10000`.

#### Embedding related documents

You can embed related documents like in the `place-infos` endpoint.

For example, the response will include associated place infos and disruptions after adding the `includeRelated=placeInfo,disruptions` parameter.

If given, the `includeRelated` parameter has to be a comma-separated list of relation names. Allowed relation names for places are:

- `source`
- `source.organization`
- `source.license`
- `sourceImport`
- `source.language`
- `placeInfo`
- `disruptions`

#### Example request

```bash
curl -v https://accessibility-cloud.freetls.fastly.net/equipment-infos.json\?appToken\=YOUR_TOKEN_HERE\&includeRelated\=disruptions\&limit\=1 | jq .
```

#### Example response

```json
{
  "type": "FeatureCollection",
  "featureCount": 1,
  "totalFeatureCount": 3010,
  "related": {
    "disruptions": {},
    "licenses": {
      "ns5HmC6xFrakRdoJ5": {
        "_id": "ns5HmC6xFrakRdoJ5",
        "name": "CC-BY 4.0 International",
        "shortName": "CC-BY 4.0 Int.",
        "websiteURL": "https://creativecommons.org/licenses/by/4.0/",
        "fullTextURL": "https://creativecommons.org/licenses/by/4.0/legalcode",
        "consideredAs": "CCBY",
        "organizationId": "6ZhFGZ97omm6uKyfn"
      }
    }
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.07710864,
          50.8825014
        ]
      },
      "properties": {
        "category": "elevator",
        "originalId": "10378163",
        "originalPlaceInfoId": "2073",
        "isWorking": true,
        "sourceId": "nwccXsd9WMekvFs3r",
        "sourceImportId": "ZNCp79ofnzXDCTPQi",
        "placeInfoId": "4mMrcqMMxkDxCQdJn",
        "_id": "dXNpJfzyaTGMQ2NtF"
      }
    }
  ]
}
```

### GET /global-stats

This API endpoint returns the time series that accessibility.cloud calculates every time it finishes an import.

#### Series filtering

- `name`: name of the statistic series you want to get. The following series are available:
  - `Meteor.users`
  - `PlaceInfos`
  - `Sources`
  - `Organizations`
  - `PlaceInfos.withoutDrafts`
  - `EquipmentInfos.withoutDrafts`
  - `EquipmentInfos.withoutDrafts.onlyEscalators`
  - `EquipmentInfos.withoutDrafts.onlyBrokenEscalators`
  - `EquipmentInfos.withoutDrafts.onlyElevators`
  - `EquipmentInfos.withoutDrafts.onlyBrokenElevators`
  - `Disruptions.withoutDrafts`
  - `Disruptions.withoutDrafts.onlyEscalators`
  - `Disruptions.withoutDrafts.onlyElevators`
  - `Sources.withoutDrafts`



#### Example request

This requests only one value with the latest known number of elevators that are out-of-service. Note that you need to specify that the backend should sort the returned data.

```bash
curl https://accessibility-cloud.freetls.fastly.net/global-stats.json?name=EquipmentInfos.withoutDrafts.onlyBrokenElevators.count&appToken=YOUR_TOKEN_HERE&sort=date&descending=1&limit=1 | jq
```

#### Example response

```json
{
  "count": 1,
  "totalCount": 7,
  "related": {},
  "results": [
    {
      "_id": "EawJ6KEdXDDmG8Fkj",
      "name": "EquipmentInfos.withoutDrafts.onlyBrokenElevators.count",
      "date": {
        "$date": 1512478862900
      },
      "value": 99
    }
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
